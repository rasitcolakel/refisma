import React from 'react'
import { InferField, MuiInferencer } from '@refinedev/inferencer/mui'

export default function PostList() {
    return (
        <MuiInferencer
            resource="posts"
            action="create"
            fieldTransformer={(field) => {
                const fieldTransforms: InferField[] = [
                    {
                        key: 'categoryId',
                        multiple: false,
                        priority: 1,
                        type: 'relation',
                        relation: true,
                        resource: {
                            name: 'categories',
                            route: '/categories',
                        },
                    },
                    {
                        key: 'authorId',
                        type: 'relation',
                        multiple: false,
                        resource: {
                            name: 'users',
                            route: '/users',
                        },
                    },
                    {
                        key: 'tags',
                        multiple: true,
                        priority: 1,
                        type: 'relation',
                        relation: true,
                        accessor: 'id',
                        resource: {
                            name: 'tags',
                            route: '/tags',
                        },
                    },
                    {
                        key: 'content',
                        type: 'text',
                        relation: false,
                        multiple: false,
                    },
                ]

                const findField = fieldTransforms.find((f) => f.key === field.key)
                console.log(field.key, field)

                if (findField) {
                    return {
                        ...findField,
                    }
                }

                return field
            }}
        />
    )
}
