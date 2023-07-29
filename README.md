# Refisma

Refisma is a tool to help you create CRUD applications by using Prisma. It generates services and endpoints for you, so you can focus on the business logic.

## Description

Refisma is a tool to help you create CRUD applications by using Prisma. It generates services and endpoints for you, so you can focus on the business logic.


## Supported Platforms

- [x] Next.js
- [ ] Node.js (Express)

## Supported UI Frameworks
- [x] MaterialUI
- [ ] ChakraUI
- [ ] Ant Design
- [ ] Mantine

## Upcoming Features

- [x] Types will be based on the Prisma schema
- [x] Zod validation
- [ ] Pagination
- [ ] Sorting
- [ ] Filtering
- [ ] Generating services and endpoints for Relations
  - [x] One to One
  - [x] One to Many
  - [x] Many to Many
- [x] Refine Pages (Only for Next.js & MaterialUI)
  - [x] List Page
  - [x] Create Page
  - [x] Edit Page
  - [x] Show Page
- [ ] Custom identifier for resources
- [ ] Providers
  - [ ] Auth
  - [ ] i18n
  - [ ] Access Control
- [ ] Compiler For Refisma
  - [ ] hide fields on views (list, create, edit, show)
  - [ ] fields accessiblities (list, create, edit, show)
- [ ] Middlewares
  - [x] Zod validation
  - [ ] Access Control

## Installation

```bash
npm install refisma
```

## Usage

```bash
npx refisma
```

### Packages Needed

```bash
npm install refisma cors @prisma/client zod

# Generate Types for Prisma 
npm install prisma --save-dev 
# or
npx prisma generate
```

### .env file

```
DATABASE_URL=""
NEXT_PUBLIC_SERVER_API_URL='http://localhost:3000/api'
```

### Adding Aliases

You need to add aliases to your tsconfig.json file.

```json
{
  ...
    "paths": {
      "@services/*": ["services/*"],
      "@schemas/*": ["schemas/*"],
      ...
    }
  ...
}
```

### Adding New Resources to _app.tsx file

The example below shows how to add a new resource to the _app.tsx file.


```tsx
  <Refine
    ...
    resources={[
      ...
      {
          name: '{{resourceName}}',
          list: '/{{resourceName}}',
          create: '/{{resourceName}}/create',
          edit: '/{{resourceName}}/edit/:id',
          show: '/{{resourceName}}/show/:id',
          meta: {
              canDelete: true,
          },
      }
      ...
    ]}
    ...
  >
```

### Generating Types for Prisma

```bash
npx prisma generate
```