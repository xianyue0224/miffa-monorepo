import prompts from "prompts"

export default async function initAction({ force }) {
    const { projectName } = await prompts({
        type: "text",
        name: "projectName",
        message: "请输入项目名称：",

    })
}