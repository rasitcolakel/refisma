import React from 'react'
import { InferField, MuiInferencer } from '@refinedev/inferencer/mui'

export default function PostList() {
    return (
        <MuiInferencer
            resource="posts"
            action="edit"
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
                        type: 'relation',
                        relation: true,
                        priority: 1,
                        accessor: 'id',
                        resource: {
                            name: 'tags',
                            route: '/tags',
                        },
                        relationInfer: {
                            key: 'name',
                            accessor: 'name',
                        },
                    },
                    {
                        key: 'content',
                        type: 'text',
                        relation: false,
                        multiple: false,
                    },
                    {
                        key: 'title',
                        type: 'text',
                        relation: false,
                        multiple: false,
                    },
                ]

                const findField = fieldTransforms.find((f) => f.key === field.key)

                if (findField) {
                    field = {
                        ...findField,
                    }
                }
                console.log(field.key, field)
                return field
            }}
        />
    )
}
