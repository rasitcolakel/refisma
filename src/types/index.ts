export type Endpoint = {
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'
    handler: (req: any, res: any) => any
    cache?: number
}
