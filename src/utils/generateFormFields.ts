import { UIFrameworks } from '@refinedev/cli'
import { Field, FormField, Model } from '../types'
import { excludeIdField, excludeNonRequiredFields, excludeRelationFields, findIdField, getAllRequiredFields } from '.'
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

export const generateRelationFormDependencies = (
    fields: Field[],
    type: 'create' | 'edit' = 'create',
    model: Model | undefined = undefined,
) => {
    const props: {
        type: string
        name: string
        resource: string
        function: string
        id?: string
        idFrom?: string
    }[] = []

    const autocompleteOptions = fields.map((field) => {
        const name = (field?.relation?.fields && field?.relation?.fields[0]) || ''
        const type = field.type.replace('[]', '').replace('?', '')
        const resourceUpper = field.type.replace('[]', '').replace('?', '')
        const resource = resourceUpper.toLowerCase()
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
            resource: model.name.toLowerCase(),
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
            const relationModel = field.relatedModel.name.replace('[]', '').replace('?', '')
            const idField = findIdField(field.relatedModel?.fields)
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
                            onChange={(_, value: ${relationModel}| null) => {
                                if (value) {
                                  field.onChange(value.${idField.name});
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
                            ${
                                type === 'edit'
                                    ? `defaultValue={${field.name}AutocompleteProps.options.find(o=>o.id===${idFieldOfModel.name}Data?.data.${field.name})}`
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
    return `{...field}
    {...register("${field.name}", {
        required: t('errors.required.field', {
            field: t('table.${field.name}'),
          }),
        
    })}`
}
