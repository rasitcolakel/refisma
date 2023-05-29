import { GitHubBanner, Refine } from '@refinedev/core'
import { RefineKbar, RefineKbarProvider } from '@refinedev/kbar'
import { notificationProvider, RefineSnackbarProvider, ThemedLayout, ThemedTitle } from '@refinedev/mui'
import routerProvider, { UnsavedChangesNotifier } from '@refinedev/nextjs-router'
import type { NextPage } from 'next'
import { AppProps } from 'next/app'

import { Header } from '@components/header'
import { ColorModeContextProvider } from '@contexts'
import { CssBaseline, GlobalStyles } from '@mui/material'
import dataProvider from '@refinedev/simple-rest'
import { appWithTranslation, useTranslation } from 'next-i18next'
import { authProvider } from 'src/authProvider'
import { AppIcon } from 'src/components/app-icon'

const API_URL = 'http://localhost:3000/api'

export type NextPageWithLayout<P = {}, IP = P> = NextPage<P, IP> & {
    noLayout?: boolean
}

type AppPropsWithLayout = AppProps & {
    Component: NextPageWithLayout
}

function MyApp({ Component, pageProps }: AppPropsWithLayout): JSX.Element {
    const renderComponent = () => {
        if (Component.noLayout) {
            return <Component {...pageProps} />
        }

        return (
            <ThemedLayout
                Header={Header}
                Title={({ collapsed }) => (
                    <ThemedTitle collapsed={collapsed} text="refine Project" icon={<AppIcon />} />
                )}
            >
                <Component {...pageProps} />
            </ThemedLayout>
        )
    }

    const { t, i18n } = useTranslation()

    const i18nProvider = {
        translate: (key: string, params: object) => t(key, params),
        changeLocale: (lang: string) => i18n.changeLanguage(lang),
        getLocale: () => i18n.language,
    }

    return (
        <>
            <GitHubBanner />
            <RefineKbarProvider>
                <ColorModeContextProvider>
                    <CssBaseline />
                    <GlobalStyles styles={{ html: { WebkitFontSmoothing: 'auto' } }} />
                    <RefineSnackbarProvider>
                        <Refine
                            routerProvider={routerProvider}
                            dataProvider={dataProvider(API_URL)}
                            notificationProvider={notificationProvider}
                            // authProvider={authProvider}
                            i18nProvider={i18nProvider}
                            resources={[
                                {
                                    name: 'posts',
                                    list: '/posts',
                                    create: '/posts/create',
                                    edit: '/posts/edit/:id',
                                    show: '/posts/show/:id',
                                    meta: {
                                        canDelete: true,
                                    },
                                },
                                {
                                    name: 'categories',
                                    list: '/categories',
                                    create: '/categories/create',
                                    edit: '/categories/edit/:id',
                                    show: '/categories/show/:id',
                                    meta: {
                                        canDelete: true,
                                    },
                                },
                                {
                                    name: 'users',
                                    list: '/users',
                                    create: '/users/create',
                                    edit: '/users/edit/:id',
                                    show: '/users/show/:id',
                                    meta: {
                                        canDelete: true,
                                    },
                                },
                            ]}
                            options={{
                                syncWithLocation: true,
                                warnWhenUnsavedChanges: true,
                            }}
                        >
                            {renderComponent()}
                            <RefineKbar />
                            <UnsavedChangesNotifier />
                        </Refine>
                    </RefineSnackbarProvider>
                </ColorModeContextProvider>
            </RefineKbarProvider>
        </>
    )
}

export default appWithTranslation(MyApp)
