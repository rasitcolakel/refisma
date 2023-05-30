import React from 'react'
import { useTranslate, HttpError, GetListResponse, GetOneResponse } from '@refinedev/core'
import { GetServerSideProps } from 'next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { useForm } from '@refinedev/react-hook-form'
import { Controller } from 'react-hook-form'
import { Post, User, Category, Tag, Prisma } from '@prisma/client'
import { TextField, Checkbox, Autocomplete, FormControl, FormLabel, Stack } from '@mui/material'
import { useAutocomplete, Create, Edit } from '@refinedev/mui'
import { axiosInstance } from '@refinedev/simple-rest'
import dataProvider from '@refinedev/simple-rest'

interface Props {
    authorIdData: GetListResponse<User>
    categoryIdData: GetListResponse<Category>
    idData: GetOneResponse<
        Post & {
            tags: Tag[]
        }
    >
    tagIdsData: GetListResponse<Tag>
}

export default function PostCreate({ authorIdData, categoryIdData, idData, tagIdsData }: Props) {
    const t = useTranslate()
    const {
        saveButtonProps,
        refineCore: { formLoading },
        register,
        control,
        getValues,
        setValue,
        formState: { errors },
    } = useForm<
        Post & {
            tags: Tag[]
        },
        HttpError
    >({
        refineCoreProps: {
            queryOptions: {
                initialData: idData,
            },
        },
    })

    const { autocompleteProps: authorIdAutocompleteProps, queryResult: authorIdQueryResult } = useAutocomplete<User>({
        queryOptions: {
            initialData: authorIdData,
        },
        resource: 'users',
        liveMode: 'auto',
        onSearch: (value: string) => [
            {
                field: 'search',
                operator: 'eq',
                value,
            },
        ],
    })

    const { autocompleteProps: categoryIdAutocompleteProps, queryResult: categoryIdQueryResult } =
        useAutocomplete<Category>({
            queryOptions: {
                initialData: categoryIdData,
            },
            resource: 'categories',
            liveMode: 'auto',
            onSearch: (value: string) => [
                {
                    field: 'search',
                    operator: 'eq',
                    value,
                },
            ],
        })
    const { autocompleteProps: tagIdsAutocompleteProps, queryResult: tagIdsQueryResult } = useAutocomplete<Tag>({
        queryOptions: {
            initialData: tagIdsData,
        },
        resource: 'tags',
        liveMode: 'auto',
        onSearch: (value: string) => [
            {
                field: 'search',
                operator: 'eq',
                value,
            },
        ],
    })

    console.log('errors', errors)
    console.log('values', getValues())
    return (
        <Edit
            isLoading={formLoading}
            saveButtonProps={{
                ...saveButtonProps,
                onClick: (e) => {
                    const tagsValue = getValues().tags as Tag[]
                    const oldTags = idData?.data.tags ?? []

                    const newTags = tagsValue.filter((tag) => !oldTags.map((t) => t.id).includes(tag.id))
                    const removedTags = oldTags.filter((tag) => !tagsValue.map((t) => t.id).includes(tag.id))

                    const tags: Prisma.TagUpdateManyWithoutPostsNestedInput = {
                        connect: newTags,
                        disconnect: removedTags,
                    }

                    setValue('tags', tags)
                    saveButtonProps.onClick(e)
                },
            }}
        >
            <Stack gap="24px">
                <FormControl key={'title'}>
                    <Controller
                        control={control}
                        name="title"
                        render={({ field }) => (
                            <>
                                <FormLabel
                                    required={true}
                                    sx={{
                                        marginBottom: '8px',
                                        fontWeight: '700',
                                        fontSize: '14px',
                                        color: 'text.primary',
                                    }}
                                >
                                    {t('table.title')}
                                </FormLabel>
                                <TextField
                                    {...field}
                                    {...register('title', {
                                        required: t('errors.required.field', {
                                            field: t('table.title'),
                                        }),
                                    })}
                                    error={!!(errors as any)?.title}
                                    helperText={(errors as any)?.title?.message}
                                    margin="none"
                                    required
                                    size="small"
                                    variant="outlined"
                                    type="text"
                                />
                            </>
                        )}
                    />
                </FormControl>
                <FormControl key={'content'}>
                    <Controller
                        control={control}
                        name="content"
                        render={({ field }) => (
                            <>
                                <FormLabel
                                    required={false}
                                    sx={{
                                        marginBottom: '8px',
                                        fontWeight: '700',
                                        fontSize: '14px',
                                        color: 'text.primary',
                                    }}
                                >
                                    {t('table.content')}
                                </FormLabel>
                                <TextField
                                    {...field}
                                    {...register('content', {
                                        required: t('errors.required.field', {
                                            field: t('table.content'),
                                        }),
                                    })}
                                    error={!!(errors as any)?.content}
                                    helperText={(errors as any)?.content?.message}
                                    margin="none"
                                    required
                                    size="small"
                                    variant="outlined"
                                    type="text"
                                />
                            </>
                        )}
                    />
                </FormControl>
                <FormControl key={'published'}>
                    <Controller
                        control={control}
                        name="published"
                        render={({ field }) => (
                            <>
                                <FormLabel
                                    required={true}
                                    sx={{
                                        marginBottom: '8px',
                                        fontWeight: '700',
                                        fontSize: '14px',
                                        color: 'text.primary',
                                    }}
                                >
                                    {t('table.published')}
                                </FormLabel>
                                <Checkbox
                                    {...field}
                                    {...register('published', {
                                        required: t('errors.required.field', {
                                            field: t('table.published'),
                                        }),
                                    })}
                                    color="primary"
                                    checked={idData?.data.published || false}
                                />
                            </>
                        )}
                    />
                </FormControl>
                <FormControl key={'authorId'}>
                    <Controller
                        control={control}
                        name="authorId"
                        render={({ field }) => (
                            <>
                                <FormLabel
                                    required={false}
                                    sx={{
                                        marginBottom: '8px',
                                        fontWeight: '700',
                                        fontSize: '14px',
                                        color: 'text.primary',
                                    }}
                                >
                                    {t('table.authorId')}
                                </FormLabel>
                                <Autocomplete
                                    {...field}
                                    {...register('authorId', {
                                        required: t('errors.required.field', {
                                            field: t('table.authorId'),
                                        }),
                                    })}
                                    {...authorIdAutocompleteProps}
                                    onChange={(_, value: User | null) => {
                                        if (value) {
                                            field.onChange(value.id)
                                        }
                                    }}
                                    getOptionLabel={(option) => option.email}
                                    renderInput={(params) => (
                                        <TextField
                                            {...params}
                                            error={!!(errors as any)?.authorId}
                                            helperText={(errors as any)?.authorId?.message}
                                            margin="none"
                                            required
                                            size="small"
                                            variant="outlined"
                                        />
                                    )}
                                    defaultValue={authorIdAutocompleteProps.options.find(
                                        (o) => o.id === idData?.data.authorId,
                                    )}
                                />
                            </>
                        )}
                    />
                </FormControl>
                <FormControl key={'categoryId'}>
                    <Controller
                        control={control}
                        name="categoryId"
                        render={({ field }) => (
                            <>
                                <FormLabel
                                    required={true}
                                    sx={{
                                        marginBottom: '8px',
                                        fontWeight: '700',
                                        fontSize: '14px',
                                        color: 'text.primary',
                                    }}
                                >
                                    {t('table.categoryId')}
                                </FormLabel>
                                <Autocomplete
                                    {...field}
                                    {...register('categoryId', {
                                        required: t('errors.required.field', {
                                            field: t('table.categoryId'),
                                        }),
                                    })}
                                    {...categoryIdAutocompleteProps}
                                    onChange={(_, value: Category | null) => {
                                        if (value) {
                                            field.onChange(value.id)
                                        }
                                    }}
                                    getOptionLabel={(option) => option.id.toString()}
                                    renderInput={(params) => (
                                        <TextField
                                            {...params}
                                            error={!!(errors as any)?.categoryId}
                                            helperText={(errors as any)?.categoryId?.message}
                                            margin="none"
                                            required
                                            size="small"
                                            variant="outlined"
                                        />
                                    )}
                                    defaultValue={categoryIdAutocompleteProps.options.find(
                                        (o) => o.id === idData?.data.categoryId,
                                    )}
                                />
                            </>
                        )}
                    />
                </FormControl>
                <FormControl key={'tags'}>
                    <Controller
                        control={control}
                        name="tags"
                        render={({ field }) => (
                            <>
                                <FormLabel
                                    required={true}
                                    sx={{
                                        marginBottom: '8px',
                                        fontWeight: '700',
                                        fontSize: '14px',
                                        color: 'text.primary',
                                    }}
                                >
                                    {t('table.tags')}
                                </FormLabel>
                                <Autocomplete
                                    {...field}
                                    {...register('tags', {
                                        required: false,
                                    })}
                                    {...tagIdsAutocompleteProps}
                                    getOptionLabel={(option) => option.id.toString()}
                                    onChange={(_, value: Tag[] | null) => {
                                        if (value) {
                                            field.onChange(value)
                                        }
                                    }}
                                    renderInput={(params) => (
                                        <TextField
                                            {...params}
                                            error={!!(errors as any)?.tags}
                                            helperText={(errors as any)?.tags?.message}
                                            margin="none"
                                            required={false}
                                            size="small"
                                            variant="outlined"
                                        />
                                    )}
                                    multiple
                                    defaultValue={idData?.data.tags}
                                />
                            </>
                        )}
                    />
                </FormControl>
            </Stack>
        </Edit>
    )
}

export const getServerSideProps: GetServerSideProps = async (context) => {
    const authorIdData = await dataProvider(process.env.NEXT_PUBLIC_SERVER_API_URL as string, axiosInstance).getList({
        resource: 'users',
    })

    const categoryIdData = await dataProvider(process.env.NEXT_PUBLIC_SERVER_API_URL as string, axiosInstance).getList({
        resource: 'categories',
    })
    const idData = await dataProvider(process.env.NEXT_PUBLIC_SERVER_API_URL as string, axiosInstance).getOne({
        resource: 'posts',
        id: context.query.id as string,
    })
    const tagIdsData = await dataProvider(process.env.NEXT_PUBLIC_SERVER_API_URL as string, axiosInstance).getList({
        resource: 'tags',
    })

    if (!idData.data) {
        return {
            notFound: true,
        }
    }

    return {
        props: {
            ...(await serverSideTranslations(context.locale ?? 'en', ['common'])),
            authorIdData,
            categoryIdData,
            idData,
            tagIdsData,
        },
    }
}
