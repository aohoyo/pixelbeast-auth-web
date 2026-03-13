import{b as i,c as K,e as C,i as t,w as l,l as a,f as s,t as r,r as y,G as T}from"./index-dNNxrLiY.js";import{_ as S}from"./_plugin-vue_export-helper-DlAUqK2U.js";const U={class:"api-docs"},D={class:"card-header"},H={class:"section"},N={class:"section"},G={class:"method-tabs"},L={class:"section"},O={class:"api-item"},V={class:"api-header"},Y={class:"api-content"},Q={class:"api-item"},M={class:"api-header"},X={class:"api-content"},j={class:"api-item"},J={class:"api-header"},F={class:"api-content"},R={class:"section"},W={class:"steps"},Z={class:"section"},$={class:"section"},ee={__name:"ApiDocs",setup(se){const c=y(window.location.origin+"/api/v1"),f=y("header"),_=async()=>{try{await navigator.clipboard.writeText(c.value),T.success("已复制")}catch{}},b=[{name:"current_version",type:"string",required:!0,desc:"当前版本号，如 v1.0.0"},{name:"device_id",type:"string",required:!1,desc:"设备唯一标识，用于灰度发布判断"},{name:"platform",type:"string",required:!1,desc:"平台：windows/macos/linux/android/ios"}],v=[{name:"has_update",type:"boolean",desc:"是否有更新"},{name:"version",type:"string",desc:"最新版本号"},{name:"version_code",type:"int",desc:"版本代码，用于版本比较"},{name:"changelog",type:"string",desc:"更新日志"},{name:"download_url",type:"string",desc:"安装包下载地址"},{name:"package_size",type:"int64",desc:"安装包大小（字节）"},{name:"package_hash",type:"string",desc:"安装包 SHA256 哈希值"},{name:"package_hash_algo",type:"string",desc:"哈希算法，默认 sha256"},{name:"is_forced",type:"boolean",desc:"是否强制更新"},{name:"is_incremental",type:"boolean",desc:"是否增量包"},{name:"min_version",type:"string",desc:"最低支持升级版本"},{name:"signature",type:"string",desc:"安装包签名（Base64）"},{name:"public_key",type:"string",desc:"签名公钥（PEM格式）"}],w=[{name:"current_version",type:"string",required:!0,desc:"当前版本号"},{name:"local_files",type:"object",required:!0,desc:"本地文件清单，key=文件路径，value=文件hash"}],h=[{name:"id",type:"int",required:!0,desc:"版本ID（从检查更新接口获取）"},{name:"device_id",type:"string",required:!1,desc:"设备唯一标识"}],k=[{code:0,msg:"success",desc:"请求成功"},{code:400,msg:"bad request",desc:"请求参数错误"},{code:401,msg:"unauthorized",desc:"API Key 无效或缺失"},{code:404,msg:"not found",desc:"资源不存在"},{code:500,msg:"internal error",desc:"服务器内部错误"}],A=[{platform:"Windows",language:"C#/.NET",features:"检查更新、下载、签名验证、安装",status:"计划中"},{platform:"macOS",language:"Swift",features:"检查更新、下载、签名验证",status:"计划中"},{platform:"Linux",language:"C/Go",features:"检查更新、下载、签名验证",status:"计划中"},{platform:"Android",language:"Kotlin/Java",features:"检查更新、下载、安装",status:"计划中"},{platform:"Electron",language:"JavaScript",features:"检查更新、下载、签名验证",status:"计划中"}];return(I,e)=>{const d=i("el-tag"),P=i("el-alert"),E=i("el-button"),m=i("el-descriptions-item"),z=i("el-descriptions"),g=i("el-tab-pane"),x=i("el-tabs"),n=i("el-table-column"),p=i("el-table"),u=i("el-step"),B=i("el-steps"),q=i("el-card");return K(),C("div",U,[t(q,{class:"doc-card"},{header:l(()=>[s("div",D,[e[2]||(e[2]=s("span",{class:"title"},"API 开发文档",-1)),t(d,{type:"info"},{default:l(()=>[...e[1]||(e[1]=[a("v1.0",-1)])]),_:1})])]),default:l(()=>[t(P,{type:"info",closable:!1,style:{"margin-bottom":"20px"}},{title:l(()=>[...e[3]||(e[3]=[a(" 本文档供客户端开发者对接升级服务使用，包含检查更新、下载、增量更新等接口。 ",-1)])]),_:1}),s("div",H,[e[7]||(e[7]=s("h2",{class:"section-title"},"📌 基础信息",-1)),t(z,{column:1,border:""},{default:l(()=>[t(m,{label:"Base URL"},{default:l(()=>[s("code",null,r(c.value),1),t(E,{type:"primary",link:"",size:"small",onClick:_},{default:l(()=>[...e[4]||(e[4]=[a("复制",-1)])]),_:1})]),_:1}),t(m,{label:"认证方式"},{default:l(()=>[...e[5]||(e[5]=[s("code",null,"API Key",-1),a(" - 在请求头或Query参数中传递 ",-1)])]),_:1}),t(m,{label:"获取 API Key"},{default:l(()=>[...e[6]||(e[6]=[a(" 在「软件管理」中创建软件后，系统会自动生成 API Key（通讯密钥） ",-1)])]),_:1})]),_:1})]),s("div",N,[e[10]||(e[10]=s("h2",{class:"section-title"},"🔐 认证方式",-1)),e[11]||(e[11]=s("p",{class:"section-desc"},"所有客户端接口都需要传递 API Key，支持以下两种方式：",-1)),s("div",G,[t(x,{modelValue:f.value,"onUpdate:modelValue":e[0]||(e[0]=o=>f.value=o)},{default:l(()=>[t(g,{label:"Header 传递（推荐）",name:"header"},{default:l(()=>[...e[8]||(e[8]=[s("div",{class:"code-block"},[s("pre",null,"X-API-Key: your-api-key-here")],-1)])]),_:1}),t(g,{label:"Query 参数传递",name:"query"},{default:l(()=>[...e[9]||(e[9]=[s("div",{class:"code-block"},[s("pre",null,"?api_key=your-api-key-here")],-1)])]),_:1})]),_:1},8,["modelValue"])])]),s("div",L,[e[37]||(e[37]=s("h2",{class:"section-title"},"📡 接口列表",-1)),s("div",O,[s("div",V,[t(d,{type:"success",size:"small"},{default:l(()=>[...e[12]||(e[12]=[a("GET/POST",-1)])]),_:1}),e[13]||(e[13]=s("code",{class:"api-path"},"/api/v1/update/check",-1)),e[14]||(e[14]=s("span",{class:"api-desc"},"检查是否有新版本",-1))]),s("div",Y,[e[15]||(e[15]=s("h4",null,"请求参数",-1)),t(p,{data:b,border:"",size:"small"},{default:l(()=>[t(n,{prop:"name",label:"参数名",width:"150"}),t(n,{prop:"type",label:"类型",width:"100"}),t(n,{prop:"required",label:"必填",width:"80"},{default:l(({row:o})=>[t(d,{type:o.required?"danger":"info",size:"small"},{default:l(()=>[a(r(o.required?"是":"否"),1)]),_:2},1032,["type"])]),_:1}),t(n,{prop:"desc",label:"说明"})]),_:1}),e[16]||(e[16]=s("h4",{style:{"margin-top":"16px"}},"请求示例",-1)),e[17]||(e[17]=s("div",{class:"code-block"},[s("pre",null,`GET /api/v1/update/check?current_version=v1.0.0&device_id=device123
Header: X-API-Key: abc123def456...`)],-1)),e[18]||(e[18]=s("h4",{style:{"margin-top":"16px"}},"响应示例",-1)),e[19]||(e[19]=s("div",{class:"code-block"},[s("pre",null,`{
  "code": 0,
  "msg": "success",
  "data": {
    "has_update": true,
    "version": "v1.1.0",
    "version_code": 10100,
    "changelog": "1. 新增功能A\\n2. 修复Bug B",
    "download_url": "https://cdn.example.com/packages/v1.1.0.zip",
    "package_size": 52428800,
    "package_hash": "abc123def456...",
    "package_hash_algo": "sha256",
    "is_forced": false,
    "is_incremental": false,
    "min_version": "v0.9.0",
    "published_at": "2024-01-15T00:00:00Z",
    "signature": "base64-signature...",
    "public_key": "-----BEGIN PUBLIC KEY-----\\n...\\n-----END PUBLIC KEY-----"
  }
}`)],-1)),e[20]||(e[20]=s("h4",{style:{"margin-top":"16px"}},"响应字段说明",-1)),t(p,{data:v,border:"",size:"small"},{default:l(()=>[t(n,{prop:"name",label:"字段名",width:"150"}),t(n,{prop:"type",label:"类型",width:"100"}),t(n,{prop:"desc",label:"说明"})]),_:1})])]),s("div",Q,[s("div",M,[t(d,{type:"primary",size:"small"},{default:l(()=>[...e[21]||(e[21]=[a("POST",-1)])]),_:1}),e[22]||(e[22]=s("code",{class:"api-path"},"/api/v1/update/delta",-1)),e[23]||(e[23]=s("span",{class:"api-desc"},"检查增量更新（文件级）",-1))]),s("div",X,[e[24]||(e[24]=s("h4",null,"请求参数（JSON Body）",-1)),t(p,{data:w,border:"",size:"small"},{default:l(()=>[t(n,{prop:"name",label:"参数名",width:"150"}),t(n,{prop:"type",label:"类型",width:"150"}),t(n,{prop:"required",label:"必填",width:"80"},{default:l(({row:o})=>[t(d,{type:o.required?"danger":"info",size:"small"},{default:l(()=>[a(r(o.required?"是":"否"),1)]),_:2},1032,["type"])]),_:1}),t(n,{prop:"desc",label:"说明"})]),_:1}),e[25]||(e[25]=s("h4",{style:{"margin-top":"16px"}},"请求示例",-1)),e[26]||(e[26]=s("div",{class:"code-block"},[s("pre",null,`POST /api/v1/update/delta
Header: X-API-Key: abc123def456...
Content-Type: application/json

{
  "current_version": "v1.0.0",
  "local_files": {
    "app.exe": "hash-of-app-exe",
    "config.ini": "hash-of-config-ini",
    "resources/data.db": "hash-of-data-db"
  }
}`)],-1)),e[27]||(e[27]=s("h4",{style:{"margin-top":"16px"}},"响应示例",-1)),e[28]||(e[28]=s("div",{class:"code-block"},[s("pre",null,`{
  "code": 0,
  "msg": "success",
  "data": {
    "has_update": true,
    "version": "v1.1.0",
    "changed_files": [
      {
        "path": "app.exe",
        "size": 20971520,
        "hash": "new-hash...",
        "hash_algo": "sha256",
        "download_url": "https://..."
      }
    ],
    "new_files": [
      {
        "path": "plugins/new.dll",
        "size": 1048576,
        "hash": "hash...",
        "download_url": "https://..."
      }
    ],
    "deleted_files": ["old_module.dll"],
    "delta_size": 22020096,
    "full_size": 52428800,
    "full_url": "https://...",
    "full_hash": "full-package-hash..."
  }
}`)],-1))])]),s("div",j,[s("div",J,[t(d,{type:"success",size:"small"},{default:l(()=>[...e[29]||(e[29]=[a("GET",-1)])]),_:1}),e[30]||(e[30]=s("code",{class:"api-path"},"/api/v1/update/download/:id",-1)),e[31]||(e[31]=s("span",{class:"api-desc"},"下载版本包",-1))]),s("div",F,[e[32]||(e[32]=s("h4",null,"请求参数",-1)),t(p,{data:h,border:"",size:"small"},{default:l(()=>[t(n,{prop:"name",label:"参数名",width:"150"}),t(n,{prop:"type",label:"类型",width:"100"}),t(n,{prop:"required",label:"必填",width:"80"},{default:l(({row:o})=>[t(d,{type:o.required?"danger":"info",size:"small"},{default:l(()=>[a(r(o.required?"是":"否"),1)]),_:2},1032,["type"])]),_:1}),t(n,{prop:"desc",label:"说明"})]),_:1}),e[33]||(e[33]=s("h4",{style:{"margin-top":"16px"}},"请求示例",-1)),e[34]||(e[34]=s("div",{class:"code-block"},[s("pre",null,`GET /api/v1/update/download/123?device_id=device123
Header: X-API-Key: abc123def456...`)],-1)),e[35]||(e[35]=s("h4",{style:{"margin-top":"16px"}},"响应",-1)),e[36]||(e[36]=s("p",null,"返回 HTTP 302 重定向到实际下载地址",-1))])])]),s("div",R,[e[43]||(e[43]=s("h2",{class:"section-title"},"🔐 签名验证",-1)),e[44]||(e[44]=s("p",{class:"section-desc"},"为确保安装包完整性和来源可信，建议客户端在安装前验证签名。",-1)),s("div",W,[e[42]||(e[42]=s("h4",null,"验证流程",-1)),t(B,{active:4,direction:"vertical"},{default:l(()=>[t(u,{title:"获取公钥"},{description:l(()=>[...e[38]||(e[38]=[s("p",null,"在管理后台「签名密钥」页面生成密钥对，将公钥硬编码到客户端代码中",-1)])]),_:1}),t(u,{title:"下载安装包"},{description:l(()=>[...e[39]||(e[39]=[s("p",null,[a("从 "),s("code",null,"download_url"),a(" 下载安装包")],-1)])]),_:1}),t(u,{title:"验证Hash"},{description:l(()=>[...e[40]||(e[40]=[s("p",null,[a("计算下载文件的 SHA256，与 "),s("code",null,"package_hash"),a(" 对比")],-1)])]),_:1}),t(u,{title:"验证签名"},{description:l(()=>[...e[41]||(e[41]=[s("p",null,[a("使用公钥验证 "),s("code",null,"signature"),a(" 是否有效")],-1)])]),_:1})]),_:1})]),e[45]||(e[45]=s("h4",{style:{"margin-top":"20px"}},"客户端验证示例（伪代码）",-1)),e[46]||(e[46]=s("div",{class:"code-block"},[s("pre",null,`// 1. 内置公钥（从管理后台复制）
const PUBLIC_KEY = \`-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA...
-----END PUBLIC KEY-----\`;

// 2. 下载文件
const fileData = await downloadFile(response.download_url);

// 3. 验证 Hash
const hash = SHA256(fileData);
if (hash !== response.package_hash) {
    throw new Error('文件校验失败');
}

// 4. 验证签名
if (!verifySignature(PUBLIC_KEY, hash, response.signature)) {
    throw new Error('签名验证失败');
}

// 5. 安装
install(fileData);`)],-1))]),s("div",Z,[e[47]||(e[47]=s("h2",{class:"section-title"},"⚠️ 错误码说明",-1)),t(p,{data:k,border:"",size:"small"},{default:l(()=>[t(n,{prop:"code",label:"错误码",width:"100"}),t(n,{prop:"msg",label:"错误信息",width:"200"}),t(n,{prop:"desc",label:"说明"})]),_:1})]),s("div",$,[e[48]||(e[48]=s("h2",{class:"section-title"},"📦 SDK 规划",-1)),e[49]||(e[49]=s("p",{class:"section-desc"},"后续将提供各平台 SDK，简化对接流程：",-1)),t(p,{data:A,border:"",size:"small"},{default:l(()=>[t(n,{prop:"platform",label:"平台",width:"120"}),t(n,{prop:"language",label:"语言",width:"120"}),t(n,{prop:"features",label:"功能"}),t(n,{prop:"status",label:"状态",width:"100"},{default:l(({row:o})=>[t(d,{type:o.status==="计划中"?"info":"success",size:"small"},{default:l(()=>[a(r(o.status),1)]),_:2},1032,["type"])]),_:1})]),_:1})])]),_:1})])}}},ne=S(ee,[["__scopeId","data-v-a3295e17"]]);export{ne as default};
