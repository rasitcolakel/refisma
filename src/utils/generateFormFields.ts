import { UIFrameworks } from '@refinedev/cli'
import { Field, FormField, Model } from '../types'
import { excludeIdField, excludeNonRequiredFields, excludeRelationFields, findIdField, getAllRequiredFields } from '.'
import { PrismaScalarTypes } from '../enums'

export const generateFormFields = (fields: FormField[], modelName: string, framework: UIFrameworks) => {
    switch (framework) {
        case UIFrameworks.MUI:
            return '<Stack gap="24px">' + generateMUIFormFields(fields, modelName) + '</Stack>'
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

export const generateRelationFormDependencies = (fields: Field[]) => {
    const props: {
        type: string
        name: string
        resource: string
    }[] = []

    const autocompleteOptions = fields.map((field) => {
        const name = (field?.relation?.fields && field?.relation?.fields[0]) || ''
        const type = field.type.replace('[]', '').replace('?', '')
        const resourceUpper = field.type.replace('[]', '').replace('?', '')
        const resource = resourceUpper.toLowerCase()
        props.push({ type: `${name}Data: GetListResponse<${type}>`, name: `${name}Data`, resource })
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

    return [props, autocompleteOptions.join('')]
}

function generateMUIFormFields(fields: FormField[], modelName: string) {
    const items = []
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
