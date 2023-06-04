import React from 'react'
import { MuiInferencer } from '@refinedev/inferencer/mui'

export default function PostList() {
    return (
        <MuiInferencer
            resource="posts"
            action="list"
            fieldTransformer={(field) => {
                if (field.key === 'tags') {
                    return {
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
                    }
                }
                if (field.key === 'authorId') {
                    return {
                        ...field,
                        canRelation: false,
                        relation: true,
                        resource: {
                            ...field.resource,
                            name: 'users',
                        },
                    }
                }

                if (field.key === 'content') {
                    return {
                        ...field,
                        type: 'text',
                        canRelation: false,
                    }
                }
                if (field.key === 'authorId') {
                    return {
                        ...field,
                        type: 'relation',
                        canRelation: false,
                    }
                }
                return field
            }}
        />
    )
}
