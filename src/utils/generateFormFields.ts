import { UIFrameworks } from '@refinedev/cli'
import { Element, Field, FormField, Model } from '../types'
import {
    excludeIdField,
    excludeNonRequiredFields,
    excludeRelationFields,
    findIdField,
    getAllRequiredFields,
    makePlural,
    mergeSameImports,
} from '.'
import { PrismaScalarTypes } from '../enums'

export const generateFormFields = (
    fields: FormField[],
    model: Model,
    framework: UIFrameworks,
    type: 'edit' | 'create' = 'create',
) => {
    switch (framework) {
        case UIFrameworks.MUI:
            return '<Stack gap="24px">' + generateMUIFormFields(fields, model, type) + '</Stack>'
        // case UIFrameworks.ANTD:
        //     return generateAntDFormFields(fields);
        // case UIFrameworks.CHAKRA:
        //     return generateChakraFormFields(fields);
        //     case UIFrameworks.MANTINE:
        //         return generateChakraFormFields(fields);
        // default:
        //     return generateMUIFormFields(fields);
    }
}

type NextPropsType = {
    type: string
    name: string
    resource: string
    function: string
    id?: string
    idFrom?: string
}

export const generateShowProps = (fields: Field[], model: Model): NextPropsType[] => {
    const props: NextPropsType[] = []

    const idField = findIdField(model.fields)
    props.push({
        type: `${idField.name}Data: GetOneResponse<${model.name}Select>`,
        name: `${idField.name}Data`,
        resource: makePlural(model.name.toLowerCase()),
        function: 'getOne',
        id: idField.name,
        idFrom: 'context.params?.id as string',
    })

    return props
}

export const generateRelationFormDependencies = (
    fields: Field[],
    type: 'create' | 'edit' = 'create',
    model: Model | undefined = undefined,
) => {
    const props: NextPropsType[] = []

    const autocompleteOptions = fields.map((field) => {
        let name = (field?.relation?.fields && field?.relation?.fields[0]) || ''
        const type = field.type.replace('[]', '').replace('?', '')
        const resourceUpper = field.type.replace('[]', '').replace('?', '')
        const resource = makePlural(resourceUpper.toLowerCase())
        const customType = !PrismaScalarTypes[type as keyof typeof PrismaScalarTypes]
        if (customType && field.isList) {
            name = field.name
        }
        props.push({
            type: `${name}Data: GetListResponse<${type}>`,
            name: `${name}Data`,
            resource,
            function: 'getList',
        })
        return `const {
            autocompleteProps: ${name}AutocompleteProps,
            queryResult: ${name}QueryResult,
          } = useAutocomplete<${resourceUpper}>({
            queryOptions: {
              initialData: ${name}Data,
            },
            resource: '${resource}',
            liveMode: 'auto',
            onSearch: (value: string) => [
              {
                field: 'search',
                operator: 'eq',
                value,
              },
            ],
          });
        `
    })

    if (type === 'edit' && model) {
        const idField = findIdField(model.fields)
        props.push({
            type: `${idField.name}Data: GetOneResponse<${model.name}>`,
            name: `${idField.name}Data`,
            resource: makePlural(model.name.toLowerCase()),
            function: 'getOne',
            id: idField.name,
            idFrom: 'context.params?.id as string',
        })
    }

    return [props, autocompleteOptions.join('')]
}

function generateMUIFormFields(fields: FormField[], model: Model, type: 'create' | 'edit' = 'create') {
    const items = []
    const idFieldOfModel = findIdField(model.fields)

    for (const field of fields) {
        if (field.elementType === 'text' || field.elementType === 'number') {
            items.push(
                insideOfController(
                    field,
                    `<TextField
                            ${commonFieldProps(field)}
                            error={!!(errors as any)?.${field.name} }
                            helperText={(errors as any)?.${field.name}?.message}
                            margin="none"
                            required
                            size="small"
                            variant="outlined"
                            type="${field.elementType}"
                        />`,
                ),
            )
        } else if (field.elementType === 'select' || field.elementType === 'autocomplete') {
            if (!field.relatedModel) {
                return
            }
            const idField = findIdField(field.relatedModel?.fields)
            const customType = !PrismaScalarTypes[field.type as keyof typeof PrismaScalarTypes] && field.isList
            let relationModel = field.relatedModel.name.replace('?', '')
            if (customType) {
                relationModel = relationModel + '[]'
            }

            const excludes = getAllRequiredFields(
                excludeRelationFields(excludeNonRequiredFields(excludeIdField(field.relatedModel.fields))),
            )
            let optionKey = idField.name
            if (excludes.length > 0) {
                optionKey = excludes[0].name
            } else {
                if (
                    idField.type === PrismaScalarTypes.Int ||
                    idField.type === PrismaScalarTypes.Float ||
                    idField.type === PrismaScalarTypes.Decimal
                ) {
                    optionKey += '.toString()'
                }
            }
            items.push(
                insideOfController(
                    field,
                    `<Autocomplete
                            ${commonFieldProps(field)}
                            {...${field.name}AutocompleteProps}
                            onChange={(_, v: ${relationModel}| null) => {
                                if (v) {
                                  field.onChange(v${!customType ? `.` + idField.name : ''});
                                }
                            }}
                            getOptionLabel={(option) => option.${optionKey}}
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    error={!!(errors as any)?.${field.name} }
                                    helperText={(errors as any)?.${field.name}?.message}
                                    margin="none"
                                    required
                                    size="small"
                                    variant="outlined"
                                />
                            )}
                            ${customType ? `multiple` : ''}
                            ${
                                type === 'edit'
                                    ? customType
                                        ? `defaultValue={${idFieldOfModel.name}Data?.data.${field.name} || []}`
                                        : `defaultValue={${field.name}AutocompleteProps.options.find(o=>o.id===${idFieldOfModel.name}Data?.data.${field.name})}`
                                    : ''
                            }
                        />`,
                ),
            )
        } else if (field.elementType === 'checkbox') {
            items.push(
                insideOfController(
                    field,
                    `<Checkbox
                            ${commonFieldProps(field)}
                            color="primary"
                            ${
                                type === 'edit'
                                    ? `checked={${idFieldOfModel.name}Data?.data.${field.name} || false}`
                                    : ''
                            }
                        />`,
                ),
            )
        }
    }
    return items.join('')
}

const insideOfController = (field: FormField, item: string) => {
    return `<FormControl key={"${field.name}"}>
        <Controller
        control={control}   
        name="${field.name}"
        render={({ field }) => (
            <>
            <FormLabel
            required={${field.isRequired}}
            sx={{
              marginBottom: '8px',
              fontWeight: '700',
              fontSize: '14px',
              color: 'text.primary',
            }}
          >
            {t('table.${field.name}')}
          </FormLabel>
            ${item}
            </>
        )}
    /></FormControl>`
}

const commonFieldProps = (field: FormField) => {
    const required = !field.isRequired
        ? 'false'
        : `t('errors.required.field', {
        field: t('table.${field.name}'),
      })`
    return `{...field}
    {...register("${field.name}", {
        required: ${required},
        
    })}`
}

interface MuiField {
    element: Element
    name: string
    import: string
    dependentImports?: string[][]
}
const muiFields: MuiField[] = [
    { element: Element.checkbox, name: 'Checkbox', import: '@mui/material' },
    { element: Element.text, name: 'TextField', import: '@mui/material' },
    { element: Element.number, name: 'TextField', import: '@mui/material' },
    {
        element: Element.autocomplete,
        name: 'Autocomplete',
        import: '@mui/material',
        dependentImports: [['useAutocomplete', '@refinedev/mui']],
    },
    {
        element: Element.select,
        name: 'Autocomplete',
        import: '@mui/material',
        dependentImports: [['useAutocomplete', '@refinedev/mui']],
    },
]

const muiFormElements = {
    create: ['Create', '@refinedev/mui'],
    edit: ['Edit', '@refinedev/mui'],
    defaultImports: [
        ['FormControl', '@mui/material'],
        ['FormLabel', '@mui/material'],
        ['Stack', '@mui/material'],
    ],
}

export const generateImportsForForm = (
    fields: FormField[],
    framework: UIFrameworks,
    type: 'edit' | 'create' = 'create',
) => {
    const imports: string[][] = []
    const formFields = framework === UIFrameworks.MUI ? muiFields : muiFields
    const formElements = framework === UIFrameworks.MUI ? muiFormElements : muiFormElements
    for (const field of fields) {
        const formField = getFormField(formFields, field.elementType)
        if (formField) {
            imports.push([formField.name, formField.import])
            if (formField.dependentImports) {
                for (const dependentImport of formField.dependentImports) {
                    imports.push(dependentImport)
                }
            }
        }
    }
    if (formElements.defaultImports) {
        for (const defaultImport of formElements.defaultImports) {
            imports.push(defaultImport)
        }
    }

    imports.push(formElements[type])
    return imports
}

const getFormField = (fields: MuiField[], element: Element) => {
    return fields.find((f) => f.element === element)
}

const muiViewElements = {
    defaultImports: [],
    singularImports: [
        ['Show', '@refinedev/mui'],
        ['Typography', '@mui/material'],
        ['Stack', '@mui/material'],
    ],
    pluralImports: [
        ['DeleteButton', '@refinedev/mui'],
        ['EditButton', '@refinedev/mui'],
        ['List', '@refinedev/mui'],
        ['ShowButton', '@refinedev/mui'],
        ['useDataGrid', '@refinedev/mui'],
        ['DataGrid', '@mui/x-data-grid'],
        ['GridColumns', '@mui/x-data-grid'],
    ],
}

export const generateImportsForView = (framework: UIFrameworks, singular: boolean = true) => {
    const imports: string[][] = []
    const formElements = framework === UIFrameworks.MUI ? muiViewElements : muiViewElements
    if (formElements.defaultImports.length > 0) imports.push(formElements.defaultImports[0])

    if (singular) {
        for (const singularImport of formElements.singularImports) {
            imports.push(singularImport)
        }
    } else {
        for (const pluralImport of formElements.pluralImports) {
            imports.push(pluralImport)
        }
    }
    return imports
}
