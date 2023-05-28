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
  - [ ] Many to Many
- [x] Refine Pages (Only for Next.js & MaterialUI)
  - [x] List Page
  - [x] Create Page
  - [x] Edit Page
  - [x] Show Page

## Installation

```bash
npm install refisma
```

## Usage

```bash
npx refisma
```

### Packages Needed

````
npm install @prisma/client zod
npm install prisma --save-dev
````

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

### Generating Types for Prisma

```bash
npx prisma generate
```