import React from 'react'
import { PostSelect } from '@services/PostsService'
import { useTranslate } from '@refinedev/core'
import { GetServerSideProps } from 'next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { DeleteButton, EditButton, List, ShowButton, useDataGrid, TagField } from '@refinedev/mui'
import { MuiInferencer } from '@refinedev/inferencer/mui'

import { DataGrid, GridColumns } from '@mui/x-data-grid'

export default function PostList() {
    return (
        <MuiInferencer
            resource="users"
            action="list"
            fieldTransformer={(field) => {
                console.log('field', field)
                if (field.key === 'categoryId') {
                    console.log('categoryIdField', field)
                }

                if (field.key === 'tags') {
                    console.log('tagsfield', field)
                    return {
                        key: 'tags',
                        type: 'relation',
                        fieldable: true,
                        accessor: 'name',
                        priority: 1,
                        multiple: true,
                        relation: true,
                        resource: {
                            name: 'tags',
                            list: '/tags',
                            create: '/tags/create',
                            edit: '/tags/edit/:id',
                            show: '/tags/show/:id',
                            meta: {
                                canDelete: true,
                            },
                            route: '/tags',
                            canCreate: true,
                            canEdit: true,
                            canShow: true,
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

                if (field.key === 'name') {
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
