# Miffa 项目脚手架

## init 命令
初始化项目

### 用法
miffa init <project-name> [options]

### 参数
#### <project-name>
初始化的项目的名称（项目根目录文件夹名）。

### 选项
#### -lp, --localPath
如果你希望在输入init命令时执行自定义的逻辑，你可以通过这个选项传递一个 **本地npm模块** 的绝对路径，脚手架会自动加载该模块的导出的方法并执行。  
该模块导出的方法的参数格式如下：
```js
function init(projectName, { force, localPath, npmPackage }) {
    console.log("项目名称", projectName) // 默认值：miffa-project
    console.log("是否强制初始化项目", force) // 默认值：false ，通过 -f 选项控制
    console.log("一个绝对路径指向本地的一个npm模块的根目录", localPath) // 通过 -lp 选项传递
    console.log("一个npm包名（附带版本信息，例如：vue@3.0.0）", npmPackage) // 通过 -np 选项传递

    // 注意：-lp -np 两个选项只能同时存在一个
}
```

#### -np, --npmPackage
和上一个选项一样，用于支持自定义init命令的执行逻辑。但这个选项应该在你的逻辑已被封装为一个npm包发布到镜像上时使用，按 `<package-name>@<version>` 的格式传递一个参数，脚手架会解析出对应的包以及版本，并自动将对应的包下载下来缓存到本地再执行。  
注意事项：
- 和上一个选项一样，你的这个npm包的入口文件应该导出一个方法，该方法会在init命令被触发时执行。
- 脚手架下载包时默认使用的镜像是 https://registry.npmmirror.com/ ，即淘宝镜像，所以请确保你的包已被淘宝镜像同步。
- 第一次执行时因为要下载包，可能会比较慢，后续走缓存会快些。

> 如果以上两个选项都不传，脚手架会默认使用内置的init命令逻辑。