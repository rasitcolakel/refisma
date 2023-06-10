import { promises } from 'fs'
import { Field, Model, RelationField, Restrictions } from './types'
import { PrismaScalarTypes, TPrismaScalarTypes } from '../../enums'

export class Prisma {
    private models: Model[] = []
    private isRefisma: boolean = false
    private file: string = ''

    constructor(file?: string) {
        if (file) {
            this.file = file
        }
    }

    public init = async () => {
        await this.parseSchema()
    }

    private async parseSchema() {
        await this.checkForRefisma()
        await this.parsePrismaSchema()
    }

    private async checkForRefisma() {
        try {
            await promises.access('prisma/schema.refisma')
            this.setIsRefisma(true)
        } catch (error: any) {
            this.setIsRefisma(error.code === 'ENOENT' ? false : true)
        }
    }

    private async parsePrismaSchema() {
        const filePath = this.file || this.isRefisma ? 'prisma/schema.refisma' : 'prisma/schema.prisma'
        const models: Model[] = []

        const refismaFile = await promises.readFile(filePath, 'utf-8')

        const lines = refismaFile.split('\n')
        let model: Model | undefined = undefined

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i]
            if (line.startsWith('//') || line.trim().startsWith('@')) continue
            if (line.startsWith('enum ')) continue
            if (line.trim().length === 0) continue
            if (line.startsWith('model ')) {
                const name = line.split(' ')[1]
                model = {
                    name,
                    fields: [],
                }
            }

            if (line.startsWith('}')) {
                if (model) {
                    models.push(model)
                    model = undefined
                }
            }

            if (line.startsWith('  ') && model) {
                const field = this.parseField(line)
                if (field) {
                    model.fields.push(field)
                }
            }
        }

        this.setModels(models)
        this.mapRelations()
    }

    private parseField(line: string): Field {
        line = line.replace(/\s+/g, ' ').trim()
        const name = line.trim().split(' ')[0]
        const type = line.trim().split(' ')[1]
        const multiple = line.includes('[]')
        const required = type.includes('?') ? false : true
        const rawType = type.replace('?', '').replace('[]', '')
        const relation = line.includes('@relation')
            ? this.parseRelation(line)
            : !PrismaScalarTypes[rawType as TPrismaScalarTypes]
        const isScalar = PrismaScalarTypes[rawType as TPrismaScalarTypes]
        return {
            name,
            type: isScalar || typeof relation !== 'boolean' ? rawType : type,
            multiple,
            required: multiple ? false : required,
            relation,
        }
    }

    private mapRelations() {
        const models = this.getModels()
        for (const model of models) {
            for (const field of model.fields) {
                if (typeof field.relation === 'object') {
                    field.relation.fields.map((fieldOfFields) => {
                        model.fields = model.fields.map((f) => {
                            if (f.name === fieldOfFields) {
                                f.relation = field.relation
                            }
                            return f
                        })
                    })
                }
            }
        }
    }

    private parseRelation(line: string): RelationField | undefined {
        if (line.includes('@relation')) {
            const name = line.trim().split(' ')[0]
            const type = line.trim().split(' ')[1]
            const relation = line.split('@relation')[1].trim()
            const multiple = relation.includes('[]')
            const required = relation.includes('@required')
            const fields = this.getFieldsFromLine(relation)
            const references = this.getReferencesFromLine(relation)
            const restrictions = this.getRestrictionsFromLine(relation)

            return {
                name,
                type,
                fields,
                references,
                restrictions,
                multiple,
                required,
            }
        }
    }

    private getFieldsFromLine(line: string): string[] {
        // (fields: [postId], references: [id])
        const fields = line.split('fields: [')[1].split(']')[0]
        return fields.split(',').map((field) => field.trim())
    }

    private getReferencesFromLine(line: string): string[] {
        // (fields: [postId], references: [id])
        const references = line.split('references: [')[1].split(']')[0]
        return references.split(',').map((field) => field.trim())
    }

    private getRestrictionsFromLine(line: string): Restrictions {
        const onUpdate = (line.split('onUpdate: ')[1]?.split(',')[0] as Restrictions['onUpdate']) || null
        const onDelete = (line.split('onDelete: ')[1]?.split(',')[0] as Restrictions['onDelete']) || null
        return {
            onUpdate,
            onDelete,
        }
    }

    private setModels(models: Model[]) {
        this.models = models
    }

    public getModels() {
        return this.models
    }

    private setIsRefisma(isRefisma: boolean) {
        this.isRefisma = isRefisma
    }

    public getIsRefisma() {
        return this.isRefisma
    }
}
