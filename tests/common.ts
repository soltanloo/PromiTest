export async function readJson(path: string) {
    let data = await import(path);
    return data.default;
}