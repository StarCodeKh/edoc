import { createSSRApp, h as h$1 } from "vue";
import { renderToString } from "@vue/server-renderer";
import { createInertiaApp } from "@inertiajs/vue3";
import createServer from "@inertiajs/vue3/server";
import { i18nVue } from "laravel-vue-i18n";
const Action$2 = "操作";
const Activities$2 = "活动";
const Address$2 = "地址";
const Archive$2 = "存档";
const Assignee$2 = "负责人";
const Assignees$2 = "负责人";
const Attachment$2 = "附件";
const Attachments$2 = "附件";
const Average$2 = "平均";
const Background$2 = "背景";
const Cancel$2 = "取消";
const Checklist$2 = "清单";
const Code$2 = "代码";
const Contacts$2 = "联系人";
const Create$2 = "创建";
const Customers$2 = "客户";
const Dashboard$2 = "仪表板";
const Delete$2 = "删除";
const Description$2 = "描述";
const Details$2 = "详情";
const Duration$2 = "持续时间";
const Edit$2 = "编辑";
const Email$2 = "电子邮件";
const Favorites$2 = "收藏夹";
const Filter$2 = "筛选";
const ID$2 = "ID";
const Label$2 = "标签";
const Labels$2 = "标签";
const Language$2 = "语言";
const List$2 = "列表";
const Login$2 = "登录";
const Logout$2 = "登出";
const Member$2 = "成员";
const Members$2 = "成员";
const Memo$2 = "备忘录";
const Menu$2 = "菜单";
const Move$2 = "移动";
const Name$2 = "名称";
const Open$2 = "打开";
const Overdue$2 = "已逾期";
const Password$2 = "密码";
const Phone$2 = "电话";
const Photo$2 = "照片";
const Position$2 = "位置";
const Project$2 = "项目";
const Projects$2 = "项目";
const Register$2 = "注册";
const Registration$2 = "注册";
const Remove$2 = "移除";
const Reset$2 = "重置";
const Role$2 = "角色";
const START$2 = "开始";
const STOP$2 = "停止";
const Save$2 = "保存";
const Slug$2 = "别名";
const Starred$2 = "已加星标";
const Started$2 = "已开始";
const Stopped$2 = "已停止";
const Submit$2 = "提交";
const Task$2 = "任务";
const Template$2 = "模板";
const Title$2 = "标题";
const Update$2 = "更新";
const User$2 = "用户";
const Users$2 = "用户";
const Website$2 = "网站";
const Workspace$2 = "工作区";
const optional$2 = "可选";
const cn = {
  Action: Action$2,
  Activities: Activities$2,
  "Add New": "新增",
  "Add Time": "添加时间",
  "Add a new item": "添加一个新项目",
  "Add a new list": "添加一个新列表",
  "Add a task": "添加一个任务",
  "Add task": "添加任务",
  "Add time manually": "手动添加时间",
  Address: Address$2,
  "Allowed File Types": "允许的文件类型",
  "App Name": "应用名称",
  Archive: Archive$2,
  "Archived Board Items": "已存档的看板项目",
  "Archived Tasks": "已存档的任务",
  Assignee: Assignee$2,
  Assignees: Assignees$2,
  Attachment: Attachment$2,
  Attachments: Attachments$2,
  Average: Average$2,
  Background: Background$2,
  Cancel: Cancel$2,
  "Change Background": "更换背景",
  "Change Task Visibility": "更改任务可见性",
  "Change Workspace": "切换工作区",
  "Check Update": "检查更新",
  Checklist: Checklist$2,
  "Clear All": "全部清除",
  "Click to rename project": "点击以重命名项目",
  "Closed Tickets": "已关闭的工单",
  Code: Code$2,
  "Confirm Password": "确认密码",
  Contacts: Contacts$2,
  Create: Create$2,
  "Create New": "创建新的",
  "Create Project": "创建项目",
  "Create Role": "创建角色",
  "Create Workspace": "创建工作区",
  "Create Workspace Type": "创建工作区类型",
  "Create a New Role": "创建一个新角色",
  "Create a new Workspace type": "创建一个新的工作区类型",
  "Create a new label": "创建一个新标签",
  "Create workspace": "创建工作区",
  "Created At": "创建于",
  "Cron Job Instruction": "定时任务指令",
  "Custom CSS": "自定义CSS",
  Customers: Customers$2,
  Dashboard: Dashboard$2,
  "Default Language": "默认语言",
  Delete: Delete$2,
  "Delete Project": "删除项目",
  "Delete User": "删除用户",
  Description: Description$2,
  Details: Details$2,
  "Due Date": "截止日期",
  "Due in the next day": "明天到期",
  Duration: Duration$2,
  Edit: Edit$2,
  "Edit Labels": "编辑标签",
  "Edit Profile": "编辑个人资料",
  Email: Email$2,
  "Email Address": "电子邮件地址",
  "Email Html": "电子邮件Html",
  "Email Notifications": "电子邮件通知",
  "Enable Registration": "启用注册",
  "Enable pre made board list": "启用预制看板列表",
  "Enabling this the tasks will be visible only for the admin and assigned people": "启用此项后，任务将仅对管理员和指定人员可见",
  "Enter a title for this task": "为此任务输入一个标题",
  "Export tasks as CSV": "将任务导出为CSV",
  "Export tasks as Excel": "将任务导出为Excel",
  Favorites: Favorites$2,
  Filter: Filter$2,
  "Filter by role": "按角色筛选",
  "Find tasks or projects": "查找任务或项目",
  "First Response Time": "首次响应时间",
  "First name": "名字",
  "Forgot your password?": "忘记密码？",
  "From Address": "发件人地址",
  "From Name": "发件人名称",
  "Global Settings": "全局设置",
  "Google ReCaptcha Site Key": "谷歌验证码站点密钥",
  ID: ID$2,
  "Invite Workspace": "邀请加入工作区",
  "Invite Workspace members": "邀请工作区成员",
  Label: Label$2,
  Labels: Labels$2,
  Language: Language$2,
  "Language Name": "语言名称",
  "Last Response Time": "最后响应时间",
  "Last name": "姓氏",
  List: List$2,
  Login: Login$2,
  Logout: Logout$2,
  "Mail Encryption": "邮件加密",
  "Make Cover": "设为封面",
  Member: Member$2,
  Members: Members$2,
  Memo: Memo$2,
  Menu: Menu$2,
  Move: Move$2,
  "Move Card": "移动卡片",
  "Move Left": "左移",
  "Move Right": "右移",
  "Move Task": "移动任务",
  "My Tasks": "我的任务",
  "My Workspaces": "我的工作区",
  Name: Name$2,
  "New Tickets": "新工单",
  "No dates": "无日期",
  "No item found!": "未找到项目！",
  "No labels found.": "未找到标签。",
  "No list found!": "未找到列表！",
  "No members": "无成员",
  "No task found!": "未找到任务！",
  "No time log found.": "未找到时间记录。",
  "No workspace found": "未找到工作区",
  Open: Open$2,
  "Open Tickets": "待处理的工单",
  Overdue: Overdue$2,
  Password: Password$2,
  Phone: Phone$2,
  Photo: Photo$2,
  Position: Position$2,
  "Pre made list": "预制列表",
  Project: Project$2,
  "Project Details": "项目详情",
  "Project name": "项目名称",
  Projects: Projects$2,
  "Recently Viewed": "最近查看",
  Register: Register$2,
  Registration: Registration$2,
  Remove: Remove$2,
  "Remove Cover": "移除封面",
  Reset: Reset$2,
  "Reset Password": "重置密码",
  "Revert Back": "恢复",
  Role: Role$2,
  "SMTP Host": "SMTP主机",
  "SMTP Password": "SMTP密码",
  "SMTP Port": "SMTP端口",
  "SMTP Username": "SMTP用户名",
  START: START$2,
  STOP: STOP$2,
  Save: Save$2,
  "Search User": "搜索用户",
  "Search labels": "搜索标签",
  "Search...": "搜索...",
  "Select a color": "选择一种颜色",
  "Select a destination": "选择一个目的地",
  "Select a workspace": "选择一个工作区",
  "Send Password Reset Link": "发送密码重置链接",
  "Send to board": "发送到看板",
  "Show Registration link on the login page": "在登录页面显示注册链接",
  "Slack Notifications": "Slack通知",
  "Slack webhook URL": "Slack Webhook URL",
  Slug: Slug$2,
  Starred: Starred$2,
  Started: Started$2,
  Stopped: Stopped$2,
  Submit: Submit$2,
  Task: Task$2,
  "Tasks assigned to me": "分配给我的任务",
  "Team Members": "团队成员",
  Template: Template$2,
  "This task is archived.": "此任务已存档。",
  "Ticket by department": "按部门分类的工单",
  "Ticket by type": "按类型分类的工单",
  "Ticket history": "工单历史",
  "Time Count": "计时",
  Title: Title$2,
  "To tasks found!": "找到任务！",
  "Top ticket creator": "顶级工单创建者",
  "Total duration": "总时长",
  "Unassigned Tickets": "未分配的工单",
  Update: Update$2,
  "Update User": "更新用户",
  User: User$2,
  Users: Users$2,
  "Visible tasks only for the assigned people.": "任务仅对指定人员可见。",
  Website: Website$2,
  Workspace: Workspace$2,
  "Workspace Description": "工作区描述",
  "Workspace Tasks": "工作区任务",
  "Workspace Type": "工作区类型",
  "Workspace name": "工作区名称",
  "Write a comment...": "写下评论...",
  "last month": "上个月",
  optional: optional$2,
  "this month": "这个月"
};
const __vite_glob_1_0 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  Action: Action$2,
  Activities: Activities$2,
  Address: Address$2,
  Archive: Archive$2,
  Assignee: Assignee$2,
  Assignees: Assignees$2,
  Attachment: Attachment$2,
  Attachments: Attachments$2,
  Average: Average$2,
  Background: Background$2,
  Cancel: Cancel$2,
  Checklist: Checklist$2,
  Code: Code$2,
  Contacts: Contacts$2,
  Create: Create$2,
  Customers: Customers$2,
  Dashboard: Dashboard$2,
  Delete: Delete$2,
  Description: Description$2,
  Details: Details$2,
  Duration: Duration$2,
  Edit: Edit$2,
  Email: Email$2,
  Favorites: Favorites$2,
  Filter: Filter$2,
  ID: ID$2,
  Label: Label$2,
  Labels: Labels$2,
  Language: Language$2,
  List: List$2,
  Login: Login$2,
  Logout: Logout$2,
  Member: Member$2,
  Members: Members$2,
  Memo: Memo$2,
  Menu: Menu$2,
  Move: Move$2,
  Name: Name$2,
  Open: Open$2,
  Overdue: Overdue$2,
  Password: Password$2,
  Phone: Phone$2,
  Photo: Photo$2,
  Position: Position$2,
  Project: Project$2,
  Projects: Projects$2,
  Register: Register$2,
  Registration: Registration$2,
  Remove: Remove$2,
  Reset: Reset$2,
  Role: Role$2,
  START: START$2,
  STOP: STOP$2,
  Save: Save$2,
  Slug: Slug$2,
  Starred: Starred$2,
  Started: Started$2,
  Stopped: Stopped$2,
  Submit: Submit$2,
  Task: Task$2,
  Template: Template$2,
  Title: Title$2,
  Update: Update$2,
  User: User$2,
  Users: Users$2,
  Website: Website$2,
  Workspace: Workspace$2,
  default: cn,
  optional: optional$2
}, Symbol.toStringTag, { value: "Module" }));
const Action$1 = "Action";
const Activities$1 = "Activities";
const Address$1 = "Address";
const Archive$1 = "Archive";
const Assignee$1 = "Assignee";
const Assignees$1 = "Assignees";
const Attachment$1 = "Attachment";
const Attachments$1 = "Attachments";
const Average$1 = "Average";
const Background$1 = "Background";
const Cancel$1 = "Cancel";
const Checklist$1 = "Checklist";
const Code$1 = "Code";
const Contacts$1 = "Contacts";
const Create$1 = "Create";
const Customers$1 = "Customers";
const Dashboard$1 = "Dashboard";
const Delete$1 = "Delete";
const Description$1 = "Description";
const Details$1 = "Details";
const Duration$1 = "Duration";
const Edit$1 = "Edit";
const Email$1 = "Email";
const Favorites$1 = "Favorites";
const Filter$1 = "Filter";
const ID$1 = "ID";
const Label$1 = "Label";
const Labels$1 = "Labels";
const Language$1 = "Language";
const List$1 = "List";
const Login$1 = "Login";
const Logout$1 = "Logout";
const Member$1 = "Member";
const Members$1 = "Members";
const Memo$1 = "Memo";
const Menu$1 = "Menu";
const Move$1 = "Move";
const Name$1 = "Name";
const Open$1 = "Open";
const Overdue$1 = "Overdue";
const Password$1 = "Password";
const Phone$1 = "Phone";
const Photo$1 = "Photo";
const Position$1 = "Position";
const Project$1 = "Project";
const Projects$1 = "Projects";
const Register$1 = "Register";
const Registration$1 = "Registration";
const Remove$1 = "Remove";
const Reset$1 = "Reset";
const Role$1 = "Role";
const START$1 = "START";
const STOP$1 = "STOP";
const Save$1 = "Save";
const Slug$1 = "Slug";
const Starred$1 = "Starred";
const Started$1 = "Started";
const Stopped$1 = "Stopped";
const Submit$1 = "Submit";
const Task$1 = "Task";
const Template$1 = "Template";
const Title$1 = "Title";
const Update$1 = "Update";
const User$1 = "User";
const Users$1 = "Users";
const Website$1 = "Website";
const Workspace$1 = "Workspace";
const optional$1 = "optional";
const en = {
  Action: Action$1,
  Activities: Activities$1,
  "Add New": "Add New",
  "Add Time": "Add Time",
  "Add a new item": "Add a new item",
  "Add a new list": "Add a new list",
  "Add a task": "Add a task",
  "Add task": "Add task",
  "Add time manually": "Add time manually",
  Address: Address$1,
  "Allowed File Types": "Allowed File Types",
  "App Name": "App Name",
  Archive: Archive$1,
  "Archived Board Items": "Archived Board Items",
  "Archived Tasks": "Archived Tasks",
  Assignee: Assignee$1,
  Assignees: Assignees$1,
  Attachment: Attachment$1,
  Attachments: Attachments$1,
  Average: Average$1,
  Background: Background$1,
  Cancel: Cancel$1,
  "Change Background": "Change Background",
  "Change Task Visibility": "Change Task Visibility",
  "Change Workspace": "Change Workspace",
  "Check Update": "Check Update",
  Checklist: Checklist$1,
  "Clear All": "Clear All",
  "Click to rename project": "Click to rename project",
  "Closed Tickets": "Closed Tickets",
  Code: Code$1,
  "Confirm Password": "Confirm Password",
  Contacts: Contacts$1,
  Create: Create$1,
  "Create New": "Create New",
  "Create Project": "Create Project",
  "Create Role": "Create Role",
  "Create Workspace": "Create Workspace",
  "Create Workspace Type": "Create Workspace Type",
  "Create a New Role": "Create a New Role",
  "Create a new Workspace type": "Create a new Workspace type",
  "Create a new label": "Create a new label",
  "Create workspace": "Create workspace",
  "Created At": "Created At",
  "Cron Job Instruction": "Cron Job Instruction",
  "Custom CSS": "Custom CSS",
  Customers: Customers$1,
  Dashboard: Dashboard$1,
  "Default Language": "Default Language",
  Delete: Delete$1,
  "Delete Project": "Delete Project",
  "Delete User": "Delete User",
  Description: Description$1,
  Details: Details$1,
  "Due Date": "Due Date",
  "Due in the next day": "Due in the next day",
  Duration: Duration$1,
  Edit: Edit$1,
  "Edit Labels": "Edit Labels",
  "Edit Profile": "Edit Profile",
  Email: Email$1,
  "Email Address": "Email Address",
  "Email Html": "Email Html",
  "Email Notifications": "Email Notifications",
  "Enable Registration": "Enable Registration",
  "Enable pre made board list": "Enable pre made board list",
  "Enabling this the tasks will be visible only for the admin and assigned people": "Enabling this the tasks will be visible only for the admin and assigned people",
  "Enter a title for this task": "Enter a title for this task",
  "Export tasks as CSV": "Export tasks as CSV",
  "Export tasks as Excel": "Export tasks as Excel",
  Favorites: Favorites$1,
  Filter: Filter$1,
  "Filter by role": "Filter by role",
  "Find tasks or projects": "Find tasks or projects",
  "First Response Time": "First Response Time",
  "First name": "First name",
  "Forgot your password?": "Forgot your password?",
  "From Address": "From Address",
  "From Name": "From Name",
  "Global Settings": "Global Settings",
  "Google ReCaptcha Site Key": "Google ReCaptcha Site Key",
  ID: ID$1,
  "Invite Workspace": "Invite Workspace",
  "Invite Workspace members": "Invite Workspace members",
  Label: Label$1,
  Labels: Labels$1,
  Language: Language$1,
  "Language Name": "Language Name",
  "Last Response Time": "Last Response Time",
  "Last name": "Last name",
  List: List$1,
  Login: Login$1,
  Logout: Logout$1,
  "Mail Encryption": "Mail Encryption",
  "Make Cover": "Make Cover",
  Member: Member$1,
  Members: Members$1,
  Memo: Memo$1,
  Menu: Menu$1,
  Move: Move$1,
  "Move Card": "Move Card",
  "Move Left": "Move Left",
  "Move Right": "Move Right",
  "Move Task": "Move Task",
  "My Tasks": "My Tasks",
  "My Workspaces": "My Workspaces",
  Name: Name$1,
  "New Tickets": "New Tickets",
  "No dates": "No dates",
  "No item found!": "No item found!",
  "No labels found.": "No labels found.",
  "No list found!": "No list found!",
  "No members": "No members",
  "No task found!": "No task found!",
  "No time log found.": "No time log found.",
  "No workspace found": "No workspace found",
  Open: Open$1,
  "Open Tickets": "Open Tickets",
  Overdue: Overdue$1,
  Password: Password$1,
  Phone: Phone$1,
  Photo: Photo$1,
  Position: Position$1,
  "Pre made list": "Pre made list",
  Project: Project$1,
  "Project Details": "Project Details",
  "Project name": "Project name",
  Projects: Projects$1,
  "Recently Viewed": "Recently Viewed",
  Register: Register$1,
  Registration: Registration$1,
  Remove: Remove$1,
  "Remove Cover": "Remove Cover",
  Reset: Reset$1,
  "Reset Password": "Reset Password",
  "Revert Back": "Revert Back",
  Role: Role$1,
  "SMTP Host": "SMTP Host",
  "SMTP Password": "SMTP Password",
  "SMTP Port": "SMTP Port",
  "SMTP Username": "SMTP Username",
  START: START$1,
  STOP: STOP$1,
  Save: Save$1,
  "Search User": "Search User",
  "Search labels": "Search labels",
  "Search...": "Search...",
  "Select a color": "Select a color",
  "Select a destination": "Select a destination",
  "Select a workspace": "Select a workspace",
  "Send Password Reset Link": "Send Password Reset Link",
  "Send to board": "Send to board",
  "Show Registration link on the login page": "Show Registration link on the login page",
  "Slack Notifications": "Slack Notifications",
  "Slack webhook URL": "Slack webhook URL",
  Slug: Slug$1,
  Starred: Starred$1,
  Started: Started$1,
  Stopped: Stopped$1,
  Submit: Submit$1,
  Task: Task$1,
  "Tasks assigned to me": "Tasks assigned to me",
  "Team Members": "Team Members",
  Template: Template$1,
  "This task is archived.": "This task is archived.",
  "Ticket by department": "Ticket by department",
  "Ticket by type": "Ticket by type",
  "Ticket history": "Ticket history",
  "Time Count": "Time Count",
  Title: Title$1,
  "To tasks found!": "To tasks found!",
  "Top ticket creator": "Top ticket creator",
  "Total duration": "Total duration",
  "Unassigned Tickets": "Unassigned Tickets",
  Update: Update$1,
  "Update User": "Update User",
  User: User$1,
  Users: Users$1,
  "Visible tasks only for the assigned people.": "Visible tasks only for the assigned people.",
  Website: Website$1,
  Workspace: Workspace$1,
  "Workspace Description": "Workspace Description",
  "Workspace Tasks": "Workspace Tasks",
  "Workspace Type": "Workspace Type",
  "Workspace name": "Workspace name",
  "Write a comment...": "Write a comment...",
  "last month": "last month",
  optional: optional$1,
  "this month": "this month"
};
const __vite_glob_1_1 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  Action: Action$1,
  Activities: Activities$1,
  Address: Address$1,
  Archive: Archive$1,
  Assignee: Assignee$1,
  Assignees: Assignees$1,
  Attachment: Attachment$1,
  Attachments: Attachments$1,
  Average: Average$1,
  Background: Background$1,
  Cancel: Cancel$1,
  Checklist: Checklist$1,
  Code: Code$1,
  Contacts: Contacts$1,
  Create: Create$1,
  Customers: Customers$1,
  Dashboard: Dashboard$1,
  Delete: Delete$1,
  Description: Description$1,
  Details: Details$1,
  Duration: Duration$1,
  Edit: Edit$1,
  Email: Email$1,
  Favorites: Favorites$1,
  Filter: Filter$1,
  ID: ID$1,
  Label: Label$1,
  Labels: Labels$1,
  Language: Language$1,
  List: List$1,
  Login: Login$1,
  Logout: Logout$1,
  Member: Member$1,
  Members: Members$1,
  Memo: Memo$1,
  Menu: Menu$1,
  Move: Move$1,
  Name: Name$1,
  Open: Open$1,
  Overdue: Overdue$1,
  Password: Password$1,
  Phone: Phone$1,
  Photo: Photo$1,
  Position: Position$1,
  Project: Project$1,
  Projects: Projects$1,
  Register: Register$1,
  Registration: Registration$1,
  Remove: Remove$1,
  Reset: Reset$1,
  Role: Role$1,
  START: START$1,
  STOP: STOP$1,
  Save: Save$1,
  Slug: Slug$1,
  Starred: Starred$1,
  Started: Started$1,
  Stopped: Stopped$1,
  Submit: Submit$1,
  Task: Task$1,
  Template: Template$1,
  Title: Title$1,
  Update: Update$1,
  User: User$1,
  Users: Users$1,
  Website: Website$1,
  Workspace: Workspace$1,
  default: en,
  optional: optional$1
}, Symbol.toStringTag, { value: "Module" }));
const Action = "សកម្មភាព";
const Activities = "សកម្មភាពនានា";
const Address = "អាសយដ្ឋាន";
const Archive = "ប័ណ្ណសារ";
const Assignee = "អ្នកទទួលបន្ទុក";
const Assignees = "អ្នកទទួលបន្ទុក";
const Attachment = "ឯកសារភ្ជាប់";
const Attachments = "ឯកសារភ្ជាប់";
const Average = "ជាមធ្យម";
const Background = "ផ្ទាំខាងក្រោយ";
const Cancel = "បោះបង់";
const Checklist = "បញ្ជីត្រួតពិនិត្យ";
const Code = "កូដ";
const Contacts = "ទំនាក់ទំនង";
const Create = "បង្កើត";
const Customers = "អតិថិជន";
const Dashboard = "ផ្ទាំងគ្រប់គ្រង";
const Delete = "លុប";
const Description = "ការពិពណ៌នា";
const Details = "ព័ត៌មានលម្អិត";
const Duration = "រយៈពេល";
const Edit = "កែសម្រួល";
const Email = "អ៊ីមែល";
const Favorites = "ចំណូលចិត្ត";
const Filter = "ត្រង";
const ID = "អត្តសញ្ញាណ (ID)";
const Label = "ស្លាក";
const Labels = "ស្លាកនានា";
const Language = "ភាសា";
const List = "បញ្ជី";
const Login = "ចូលគណនី";
const Logout = "ចាកចេញ";
const Member = "សមាជិក";
const Members = "សមាជិក";
const Memo = "កំណត់ចំណាំ";
const Menu = "ម៉ឺនុយ";
const Move = "ផ្លាស់ទី";
const Name = "ឈ្មោះ";
const Open = "បើក";
const Overdue = "ហួសកាលកំណត់";
const Password = "ពាក្យសម្ងាត់";
const Phone = "ទូរសព្ទ";
const Photo = "រូបថត";
const Position = "តំណែង";
const Project = "គម្រោង";
const Projects = "គម្រោងនានា";
const Register = "ចុះឈ្មោះ";
const Registration = "ការចុះឈ្មោះ";
const Remove = "លុបចេញ";
const Reset = "កំណត់ឡើងវិញ";
const Role = "តួនាទី";
const START = "ចាប់ផ្តើម";
const STOP = "បញ្ឈប់";
const Save = "រក្សាទុក";
const Slug = "ស្លាកអត្ថបទ (Slug)";
const Starred = "បានដាក់ផ្កាយ";
const Started = "បានចាប់ផ្តើម";
const Stopped = "បានបញ្ឈប់";
const Submit = "បញ្ជូន";
const Task = "ភារកិច្ច";
const Template = "គំរូ";
const Title = "ចំណងជើង";
const Update = "ធ្វើបច្ចុប្បន្នភាព";
const User = "អ្នកប្រើប្រាស់";
const Users = "អ្នកប្រើប្រាស់នានា";
const Website = "គេហទំព័រ";
const Workspace = "កន្លែងការងារ";
const optional = "ស្រេចចិត្ត";
const kh = {
  Action,
  Activities,
  "Add New": "បន្ថែមថ្មី",
  "Add Time": "បន្ថែមម៉ោង",
  "Add a new item": "បន្ថែមធាតុថ្មី",
  "Add a new list": "បន្ថែមបញ្ជីថ្មី",
  "Add a task": "បន្ថែមភារកិច្ច",
  "Add task": "បន្ថែមភារកិច្ច",
  "Add time manually": "បន្ថែមម៉ោងដោយដៃ",
  Address,
  "Allowed File Types": "ប្រភេទឯកសារដែលអនុញ្ញាត",
  "App Name": "ឈ្មោះកម្មវិធី",
  Archive,
  "Archived Board Items": "ធាតុប័ណ្ណសាររបស់ក្ដារខៀន",
  "Archived Tasks": "ភារកិច្ចក្នុងប័ណ្ណសារ",
  Assignee,
  Assignees,
  Attachment,
  Attachments,
  Average,
  Background,
  Cancel,
  "Change Background": "ប្តូរផ្ទៃខាងក្រោយ",
  "Change Task Visibility": "ប្តូរភាពមើលឃើញនៃភារកិច្ច",
  "Change Workspace": "ប្តូរកន្លែងការងារ",
  "Check Update": "ពិនិត្យភាពទាន់សម័យ",
  Checklist,
  "Clear All": "សម្អាតទាំងអស់",
  "Click to rename project": "ចុចទីនេះដើម្បីប្តូរឈ្មោះគម្រោង",
  "Closed Tickets": "សំបុត្រដែលបានបិទ",
  Code,
  "Confirm Password": "បញ្ជាក់ពាក្យសម្ងាត់",
  Contacts,
  Create,
  "Create New": "បង្កើតថ្មី",
  "Create Project": "បង្កើតគម្រោង",
  "Create Role": "បង្កើតតួនាទី",
  "Create Workspace": "បង្កើតកន្លែងការងារ",
  "Create Workspace Type": "បង្កើតប្រភេទកន្លែងការងារ",
  "Create a New Role": "បង្កើតតួនាទីថ្មី",
  "Create a new Workspace type": "បង្កើតប្រភេទកន្លែងការងារថ្មី",
  "Create a new label": "បង្កើតស្លាកសញ្ញាថ្មី",
  "Create workspace": "បង្កើតកន្លែងការងារ",
  "Created At": "បានបង្កើតនៅ",
  "Cron Job Instruction": "ការណែនាំអំពី Cron Job",
  "Custom CSS": "CSS ផ្ទាល់ខ្លួន",
  Customers,
  Dashboard,
  "Default Language": "ភាសាដើម",
  Delete,
  "Delete Project": "លុបគម្រោង",
  "Delete User": "លុបអ្នកប្រើប្រាស់",
  Description,
  Details,
  "Due Date": "កាលបរិច្ឆេទកំណត់",
  "Due in the next day": "ដល់កំណត់ថ្ងៃស្អែក",
  Duration,
  Edit,
  "Edit Labels": "កែសម្រួលស្លាក",
  "Edit Profile": "កែសម្រួលប្រវត្តិរូប",
  Email,
  "Email Address": "អាសយដ្ឋានអ៊ីមែល",
  "Email Html": "អ៊ីមែល HTML",
  "Email Notifications": "ការជូនដំណឹងតាមអ៊ីមែល",
  "Enable Registration": "បើកឱ្យចុះឈ្មោះ",
  "Enable pre made board list": "បើកដំណើរការបញ្ជីក្ដារខៀនដែលបានបង្កើតរួច",
  "Enabling this the tasks will be visible only for the admin and assigned people": "ការបើកដំណើរការនេះ ភារកិច្ចនឹងមើលឃើញតែសម្រាប់អ្នកគ្រប់គ្រង និងអ្នកដែលបានចាត់តាំងប៉ុណ្ណោះ",
  "Enter a title for this task": "បញ្ចូលចំណងជើងសម្រាប់ភារកិច្ចនេះ",
  "Export tasks as CSV": "នាំចេញភារកិច្ចជា CSV",
  "Export tasks as Excel": "នាំចេញភារកិច្ចជា Excel",
  Favorites,
  Filter,
  "Filter by role": "តម្រងតាមតួនាទី",
  "Find tasks or projects": "ស្វែងរកភារកិច្ច ឬគម្រោង",
  "First Response Time": "ពេលវេលាឆ្លើយតបដំបូង",
  "First name": "នាមខ្លួន",
  "Forgot your password?": "ភ្លេចពាក្យសម្ងាត់មែនទេ?",
  "From Address": "ពីអាសយដ្ឋាន",
  "From Name": "ពីឈ្មោះ",
  "Global Settings": "ការកំណត់ជាសកល",
  "Google ReCaptcha Site Key": "សោគេហទំព័រ Google ReCaptcha",
  ID,
  "Invite Workspace": "អញ្ជើញចូលកន្លែងការងារ",
  "Invite Workspace members": "អញ្ជើញសមាជិកកន្លែងការងារ",
  Label,
  Labels,
  Language,
  "Language Name": "ឈ្មោះភាសា",
  "Last Response Time": "ពេលវេលាឆ្លើយតបចុងក្រោយ",
  "Last name": "នាមត្រកូល",
  List,
  Login,
  Logout,
  "Mail Encryption": "ការអ៊ិនគ្រីបអ៊ីមែល",
  "Make Cover": "ធ្វើជាក្រប",
  Member,
  Members,
  Memo,
  Menu,
  Move,
  "Move Card": "ផ្លាស់ទីកាត",
  "Move Left": "ផ្លាស់ទីទៅឆ្វេង",
  "Move Right": "ផ្លាស់ទីទៅស្តាំ",
  "Move Task": "ផ្លាស់ទីភារកិច្ច",
  "My Tasks": "ភារកិច្ចរបស់ខ្ញុំ",
  "My Workspaces": "កន្លែងការងាររបស់ខ្ញុំ",
  Name,
  "New Tickets": "សំបុត្រសំណូមពរថ្មី",
  "No dates": "គ្មានកាលបរិច្ឆេទ",
  "No item found!": "រកមិនឃើញធាតុទេ!",
  "No labels found.": "រកមិនឃើញស្លាកសញ្ញាទេ។",
  "No list found!": "រកមិនឃើញបញ្ជីទេ!",
  "No members": "គ្មានសមាជិក",
  "No task found!": "រកមិនឃើញភារកិច្ចទេ!",
  "No time log found.": "រកមិនឃើញកំណត់ហេតុពេលវេលាទេ។",
  "No workspace found": "រកមិនឃើញកន្លែងការងារទេ",
  Open,
  "Open Tickets": "សំបុត្រដែលកំពុងបើក",
  Overdue,
  Password,
  Phone,
  Photo,
  Position,
  "Pre made list": "បញ្ជីដែលបានបង្កើតរួច",
  Project,
  "Project Details": "ព័ត៌មានលម្អិតនៃគម្រោង",
  "Project name": "ឈ្មោះគម្រោង",
  Projects,
  "Recently Viewed": "បានមើលថ្មីៗនេះ",
  Register,
  Registration,
  Remove,
  "Remove Cover": "ដកក្របចេញ",
  Reset,
  "Reset Password": "កំណត់ពាក្យសម្ងាត់ឡើងវិញ",
  "Revert Back": "ត្រឡប់ក្រោយ",
  Role,
  "SMTP Host": "ម៉ាស៊ីនបម្រើ SMTP",
  "SMTP Password": "ពាក្យសម្ងាត់ SMTP",
  "SMTP Port": "ច្រក SMTP",
  "SMTP Username": "ឈ្មោះអ្នកប្រើប្រាស់ SMTP",
  START,
  STOP,
  Save,
  "Search User": "ស្វែងរកអ្នកប្រើប្រាស់",
  "Search labels": "ស្វែងរកស្លាក",
  "Search...": "ស្វែងរក...",
  "Select a color": "ជ្រើសរើសពណ៌",
  "Select a destination": "ជ្រើសរើសទិសដៅ",
  "Select a workspace": "ជ្រើសរើសកន្លែងការងារ",
  "Send Password Reset Link": "ផ្ញើតំណភ្ជាប់កំណត់ពាក្យសម្ងាត់ឡើងវិញ",
  "Send to board": "ផ្ញើទៅកាន់ក្ដារខៀន",
  "Show Registration link on the login page": "បង្ហាញតំណចុះឈ្មោះនៅលើទំព័រចូលគណនី",
  "Slack Notifications": "ការជូនដំណឹងតាម Slack",
  "Slack webhook URL": "អាសយដ្ឋាន Webhook របស់ Slack",
  Slug,
  Starred,
  Started,
  Stopped,
  Submit,
  Task,
  "Tasks assigned to me": "ភារកិច្ចដែលបានចាត់តាំងឱ្យខ្ញុំ",
  "Team Members": "សមាជិកក្រុម",
  Template,
  "This task is archived.": "ភារកិច្ចនេះត្រូវបានដាក់ក្នុងប័ណ្ណសារ។",
  "Ticket by department": "សំបុត្រតាមដេប៉ាតឺម៉ង់",
  "Ticket by type": "សំបុត្រតាមប្រភេទ",
  "Ticket history": "ប្រវត្តិសំបុត្រ",
  "Time Count": "ការរាប់ម៉ោង",
  Title,
  "To tasks found!": "រកមិនឃើញភារកិច្ចទេ!",
  "Top ticket creator": "អ្នកបង្កើតសំបុត្រច្រើនជាងគេ",
  "Total duration": "រយៈពេលសរុប",
  "Unassigned Tickets": "សំបុត្រដែលមិនទាន់ចាត់តាំង",
  Update,
  "Update User": "ធ្វើបច្ចុប្បន្នភាពអ្នកប្រើប្រាស់",
  User,
  Users,
  "Visible tasks only for the assigned people.": "មើលឃើញភារកិច្ចเฉพาะសម្រាប់អ្នកដែលបានចាត់តាំងប៉ុណ្ណោះ។",
  Website,
  Workspace,
  "Workspace Description": "ការពិពណ៌នាកន្លែងការងារ",
  "Workspace Tasks": "ភារកិច្ចកន្លែងការងារ",
  "Workspace Type": "ប្រភេទកន្លែងការងារ",
  "Workspace name": "ឈ្មោះកន្លែងការងារ",
  "Write a comment...": "សរសេរមតិយោបល់...",
  "last month": "ខែមុន",
  optional,
  "this month": "ខែនេះ"
};
const __vite_glob_1_2 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  Action,
  Activities,
  Address,
  Archive,
  Assignee,
  Assignees,
  Attachment,
  Attachments,
  Average,
  Background,
  Cancel,
  Checklist,
  Code,
  Contacts,
  Create,
  Customers,
  Dashboard,
  Delete,
  Description,
  Details,
  Duration,
  Edit,
  Email,
  Favorites,
  Filter,
  ID,
  Label,
  Labels,
  Language,
  List,
  Login,
  Logout,
  Member,
  Members,
  Memo,
  Menu,
  Move,
  Name,
  Open,
  Overdue,
  Password,
  Phone,
  Photo,
  Position,
  Project,
  Projects,
  Register,
  Registration,
  Remove,
  Reset,
  Role,
  START,
  STOP,
  Save,
  Slug,
  Starred,
  Started,
  Stopped,
  Submit,
  Task,
  Template,
  Title,
  Update,
  User,
  Users,
  Website,
  Workspace,
  default: kh,
  optional
}, Symbol.toStringTag, { value: "Module" }));
const php_en = {
  "auth.failed": "These credentials do not match our records.",
  "auth.password": "The provided password is incorrect.",
  "auth.throttle": "Too many login attempts. Please try again in :seconds seconds.",
  "pagination.previous": "&laquo; Previous",
  "pagination.next": "Next &raquo;",
  "passwords.reset": "Your password has been reset.",
  "passwords.sent": "We have emailed your password reset link.",
  "passwords.throttled": "Please wait before retrying.",
  "passwords.token": "This password reset token is invalid.",
  "passwords.user": "We can't find a user with that email address.",
  "validation.accepted": "The :attribute field must be accepted.",
  "validation.accepted_if": "The :attribute field must be accepted when :other is :value.",
  "validation.active_url": "The :attribute field must be a valid URL.",
  "validation.after": "The :attribute field must be a date after :date.",
  "validation.after_or_equal": "The :attribute field must be a date after or equal to :date.",
  "validation.alpha": "The :attribute field must only contain letters.",
  "validation.alpha_dash": "The :attribute field must only contain letters, numbers, dashes, and underscores.",
  "validation.alpha_num": "The :attribute field must only contain letters and numbers.",
  "validation.array": "The :attribute field must be an array.",
  "validation.ascii": "The :attribute field must only contain single-byte alphanumeric characters and symbols.",
  "validation.before": "The :attribute field must be a date before :date.",
  "validation.before_or_equal": "The :attribute field must be a date before or equal to :date.",
  "validation.between.array": "The :attribute field must have between :min and :max items.",
  "validation.between.file": "The :attribute field must be between :min and :max kilobytes.",
  "validation.between.numeric": "The :attribute field must be between :min and :max.",
  "validation.between.string": "The :attribute field must be between :min and :max characters.",
  "validation.boolean": "The :attribute field must be true or false.",
  "validation.can": "The :attribute field contains an unauthorized value.",
  "validation.confirmed": "The :attribute field confirmation does not match.",
  "validation.current_password": "The password is incorrect.",
  "validation.date": "The :attribute field must be a valid date.",
  "validation.date_equals": "The :attribute field must be a date equal to :date.",
  "validation.date_format": "The :attribute field must match the format :format.",
  "validation.decimal": "The :attribute field must have :decimal decimal places.",
  "validation.declined": "The :attribute field must be declined.",
  "validation.declined_if": "The :attribute field must be declined when :other is :value.",
  "validation.different": "The :attribute field and :other must be different.",
  "validation.digits": "The :attribute field must be :digits digits.",
  "validation.digits_between": "The :attribute field must be between :min and :max digits.",
  "validation.dimensions": "The :attribute field has invalid image dimensions.",
  "validation.distinct": "The :attribute field has a duplicate value.",
  "validation.doesnt_end_with": "The :attribute field must not end with one of the following: :values.",
  "validation.doesnt_start_with": "The :attribute field must not start with one of the following: :values.",
  "validation.email": "The :attribute field must be a valid email address.",
  "validation.ends_with": "The :attribute field must end with one of the following: :values.",
  "validation.enum": "The selected :attribute is invalid.",
  "validation.exists": "The selected :attribute is invalid.",
  "validation.extensions": "The :attribute field must have one of the following extensions: :values.",
  "validation.file": "The :attribute field must be a file.",
  "validation.filled": "The :attribute field must have a value.",
  "validation.gt.array": "The :attribute field must have more than :value items.",
  "validation.gt.file": "The :attribute field must be greater than :value kilobytes.",
  "validation.gt.numeric": "The :attribute field must be greater than :value.",
  "validation.gt.string": "The :attribute field must be greater than :value characters.",
  "validation.gte.array": "The :attribute field must have :value items or more.",
  "validation.gte.file": "The :attribute field must be greater than or equal to :value kilobytes.",
  "validation.gte.numeric": "The :attribute field must be greater than or equal to :value.",
  "validation.gte.string": "The :attribute field must be greater than or equal to :value characters.",
  "validation.hex_color": "The :attribute field must be a valid hexadecimal color.",
  "validation.image": "The :attribute field must be an image.",
  "validation.in": "The selected :attribute is invalid.",
  "validation.in_array": "The :attribute field must exist in :other.",
  "validation.integer": "The :attribute field must be an integer.",
  "validation.ip": "The :attribute field must be a valid IP address.",
  "validation.ipv4": "The :attribute field must be a valid IPv4 address.",
  "validation.ipv6": "The :attribute field must be a valid IPv6 address.",
  "validation.json": "The :attribute field must be a valid JSON string.",
  "validation.lowercase": "The :attribute field must be lowercase.",
  "validation.lt.array": "The :attribute field must have less than :value items.",
  "validation.lt.file": "The :attribute field must be less than :value kilobytes.",
  "validation.lt.numeric": "The :attribute field must be less than :value.",
  "validation.lt.string": "The :attribute field must be less than :value characters.",
  "validation.lte.array": "The :attribute field must not have more than :value items.",
  "validation.lte.file": "The :attribute field must be less than or equal to :value kilobytes.",
  "validation.lte.numeric": "The :attribute field must be less than or equal to :value.",
  "validation.lte.string": "The :attribute field must be less than or equal to :value characters.",
  "validation.mac_address": "The :attribute field must be a valid MAC address.",
  "validation.max.array": "The :attribute field must not have more than :max items.",
  "validation.max.file": "The :attribute field must not be greater than :max kilobytes.",
  "validation.max.numeric": "The :attribute field must not be greater than :max.",
  "validation.max.string": "The :attribute field must not be greater than :max characters.",
  "validation.max_digits": "The :attribute field must not have more than :max digits.",
  "validation.mimes": "The :attribute field must be a file of type: :values.",
  "validation.mimetypes": "The :attribute field must be a file of type: :values.",
  "validation.min.array": "The :attribute field must have at least :min items.",
  "validation.min.file": "The :attribute field must be at least :min kilobytes.",
  "validation.min.numeric": "The :attribute field must be at least :min.",
  "validation.min.string": "The :attribute field must be at least :min characters.",
  "validation.min_digits": "The :attribute field must have at least :min digits.",
  "validation.missing": "The :attribute field must be missing.",
  "validation.missing_if": "The :attribute field must be missing when :other is :value.",
  "validation.missing_unless": "The :attribute field must be missing unless :other is :value.",
  "validation.missing_with": "The :attribute field must be missing when :values is present.",
  "validation.missing_with_all": "The :attribute field must be missing when :values are present.",
  "validation.multiple_of": "The :attribute field must be a multiple of :value.",
  "validation.not_in": "The selected :attribute is invalid.",
  "validation.not_regex": "The :attribute field format is invalid.",
  "validation.numeric": "The :attribute field must be a number.",
  "validation.password.letters": "The :attribute field must contain at least one letter.",
  "validation.password.mixed": "The :attribute field must contain at least one uppercase and one lowercase letter.",
  "validation.password.numbers": "The :attribute field must contain at least one number.",
  "validation.password.symbols": "The :attribute field must contain at least one symbol.",
  "validation.password.uncompromised": "The given :attribute has appeared in a data leak. Please choose a different :attribute.",
  "validation.present": "The :attribute field must be present.",
  "validation.present_if": "The :attribute field must be present when :other is :value.",
  "validation.present_unless": "The :attribute field must be present unless :other is :value.",
  "validation.present_with": "The :attribute field must be present when :values is present.",
  "validation.present_with_all": "The :attribute field must be present when :values are present.",
  "validation.prohibited": "The :attribute field is prohibited.",
  "validation.prohibited_if": "The :attribute field is prohibited when :other is :value.",
  "validation.prohibited_unless": "The :attribute field is prohibited unless :other is in :values.",
  "validation.prohibits": "The :attribute field prohibits :other from being present.",
  "validation.regex": "The :attribute field format is invalid.",
  "validation.required": "The :attribute field is required.",
  "validation.required_array_keys": "The :attribute field must contain entries for: :values.",
  "validation.required_if": "The :attribute field is required when :other is :value.",
  "validation.required_if_accepted": "The :attribute field is required when :other is accepted.",
  "validation.required_unless": "The :attribute field is required unless :other is in :values.",
  "validation.required_with": "The :attribute field is required when :values is present.",
  "validation.required_with_all": "The :attribute field is required when :values are present.",
  "validation.required_without": "The :attribute field is required when :values is not present.",
  "validation.required_without_all": "The :attribute field is required when none of :values are present.",
  "validation.same": "The :attribute field must match :other.",
  "validation.size.array": "The :attribute field must contain :size items.",
  "validation.size.file": "The :attribute field must be :size kilobytes.",
  "validation.size.numeric": "The :attribute field must be :size.",
  "validation.size.string": "The :attribute field must be :size characters.",
  "validation.starts_with": "The :attribute field must start with one of the following: :values.",
  "validation.string": "The :attribute field must be a string.",
  "validation.timezone": "The :attribute field must be a valid timezone.",
  "validation.unique": "The :attribute has already been taken.",
  "validation.uploaded": "The :attribute failed to upload.",
  "validation.uppercase": "The :attribute field must be uppercase.",
  "validation.url": "The :attribute field must be a valid URL.",
  "validation.ulid": "The :attribute field must be a valid ULID.",
  "validation.uuid": "The :attribute field must be a valid UUID.",
  "validation.custom.attribute-name.rule-name": "custom-message"
};
const __vite_glob_1_3 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: php_en
}, Symbol.toStringTag, { value: "Module" }));
async function resolvePageComponent(path, pages) {
  for (const p2 of Array.isArray(path) ? path : [path]) {
    const page = pages[p2];
    if (typeof page === "undefined") {
      continue;
    }
    return typeof page === "function" ? page() : page;
  }
  throw new Error(`Page not found: ${path}`);
}
function t() {
  return t = Object.assign ? Object.assign.bind() : function(t3) {
    for (var e2 = 1; e2 < arguments.length; e2++) {
      var o2 = arguments[e2];
      for (var n2 in o2) ({}).hasOwnProperty.call(o2, n2) && (t3[n2] = o2[n2]);
    }
    return t3;
  }, t.apply(null, arguments);
}
const e = String.prototype.replace, o = /%20/g, n = { RFC1738: function(t3) {
  return e.call(t3, o, "+");
}, RFC3986: function(t3) {
  return String(t3);
} };
var r = "RFC3986";
const i = Object.prototype.hasOwnProperty, s = Array.isArray, u = /* @__PURE__ */ new WeakMap();
var l = function(t3, e2) {
  return u.set(t3, e2), t3;
};
function c(t3) {
  return u.has(t3);
}
var a = function(t3) {
  return u.get(t3);
}, f = function(t3, e2) {
  u.set(t3, e2);
};
const p = (function() {
  const t3 = [];
  for (let e2 = 0; e2 < 256; ++e2) t3.push("%" + ((e2 < 16 ? "0" : "") + e2.toString(16)).toUpperCase());
  return t3;
})(), y = function(t3, e2) {
  const o2 = e2 && e2.plainObjects ? /* @__PURE__ */ Object.create(null) : {};
  for (let e3 = 0; e3 < t3.length; ++e3) void 0 !== t3[e3] && (o2[e3] = t3[e3]);
  return o2;
}, d = function t2(e2, o2, n2) {
  if (!o2) return e2;
  if ("object" != typeof o2) {
    if (s(e2)) e2.push(o2);
    else {
      if (!e2 || "object" != typeof e2) return [e2, o2];
      if (c(e2)) {
        var r2 = a(e2) + 1;
        e2[r2] = o2, f(e2, r2);
      } else (n2 && (n2.plainObjects || n2.allowPrototypes) || !i.call(Object.prototype, o2)) && (e2[o2] = true);
    }
    return e2;
  }
  if (!e2 || "object" != typeof e2) {
    if (c(o2)) {
      for (var u2 = Object.keys(o2), p2 = n2 && n2.plainObjects ? { __proto__: null, 0: e2 } : { 0: e2 }, d2 = 0; d2 < u2.length; d2++) p2[parseInt(u2[d2], 10) + 1] = o2[u2[d2]];
      return l(p2, a(o2) + 1);
    }
    return [e2].concat(o2);
  }
  let h2 = e2;
  return s(e2) && !s(o2) && (h2 = y(e2, n2)), s(e2) && s(o2) ? (o2.forEach(function(o3, r3) {
    if (i.call(e2, r3)) {
      const i2 = e2[r3];
      i2 && "object" == typeof i2 && o3 && "object" == typeof o3 ? e2[r3] = t2(i2, o3, n2) : e2.push(o3);
    } else e2[r3] = o3;
  }), e2) : Object.keys(o2).reduce(function(e3, r3) {
    const s2 = o2[r3];
    return e3[r3] = i.call(e3, r3) ? t2(e3[r3], s2, n2) : s2, e3;
  }, h2);
}, h = 1024, b = function(t3, e2, o2, n2) {
  if (c(t3)) {
    var r2 = a(t3) + 1;
    return t3[r2] = e2, f(t3, r2), t3;
  }
  var i2 = [].concat(t3, e2);
  return i2.length > o2 ? l(y(i2, { plainObjects: n2 }), i2.length - 1) : i2;
}, m = function(t3, e2) {
  if (s(t3)) {
    const o2 = [];
    for (let n2 = 0; n2 < t3.length; n2 += 1) o2.push(e2(t3[n2]));
    return o2;
  }
  return e2(t3);
}, g = Object.prototype.hasOwnProperty, w = { brackets: function(t3) {
  return t3 + "[]";
}, comma: "comma", indices: function(t3, e2) {
  return t3 + "[" + e2 + "]";
}, repeat: function(t3) {
  return t3;
} }, v = Array.isArray, j = Array.prototype.push, $ = function(t3, e2) {
  j.apply(t3, v(e2) ? e2 : [e2]);
}, E = Date.prototype.toISOString, O = { addQueryPrefix: false, allowDots: false, allowEmptyArrays: false, arrayFormat: "indices", charset: "utf-8", charsetSentinel: false, delimiter: "&", encode: true, encodeDotInKeys: false, encoder: function(t3, e2, o2, n2, r2) {
  if (0 === t3.length) return t3;
  let i2 = t3;
  if ("symbol" == typeof t3 ? i2 = Symbol.prototype.toString.call(t3) : "string" != typeof t3 && (i2 = String(t3)), "iso-8859-1" === o2) return escape(i2).replace(/%u[0-9a-f]{4}/gi, function(t4) {
    return "%26%23" + parseInt(t4.slice(2), 16) + "%3B";
  });
  let s2 = "";
  for (let t4 = 0; t4 < i2.length; t4 += h) {
    const e3 = i2.length >= h ? i2.slice(t4, t4 + h) : i2, o3 = [];
    for (let t5 = 0; t5 < e3.length; ++t5) {
      let n3 = e3.charCodeAt(t5);
      45 === n3 || 46 === n3 || 95 === n3 || 126 === n3 || n3 >= 48 && n3 <= 57 || n3 >= 65 && n3 <= 90 || n3 >= 97 && n3 <= 122 || "RFC1738" === r2 && (40 === n3 || 41 === n3) ? o3[o3.length] = e3.charAt(t5) : n3 < 128 ? o3[o3.length] = p[n3] : n3 < 2048 ? o3[o3.length] = p[192 | n3 >> 6] + p[128 | 63 & n3] : n3 < 55296 || n3 >= 57344 ? o3[o3.length] = p[224 | n3 >> 12] + p[128 | n3 >> 6 & 63] + p[128 | 63 & n3] : (t5 += 1, n3 = 65536 + ((1023 & n3) << 10 | 1023 & e3.charCodeAt(t5)), o3[o3.length] = p[240 | n3 >> 18] + p[128 | n3 >> 12 & 63] + p[128 | n3 >> 6 & 63] + p[128 | 63 & n3]);
    }
    s2 += o3.join("");
  }
  return s2;
}, encodeValuesOnly: false, format: r, formatter: n[r], indices: false, serializeDate: function(t3) {
  return E.call(t3);
}, skipNulls: false, strictNullHandling: false }, T = {}, R = function(t3, e2, o2, n2, r2, i2, s2, u2, l2, c2, a2, f2, p2, y2, d2, h2, b2, g2) {
  let w2 = t3, j2 = g2, E2 = 0, _2 = false;
  for (; void 0 !== (j2 = j2.get(T)) && !_2; ) {
    const e3 = j2.get(t3);
    if (E2 += 1, void 0 !== e3) {
      if (e3 === E2) throw new RangeError("Cyclic object value");
      _2 = true;
    }
    void 0 === j2.get(T) && (E2 = 0);
  }
  if ("function" == typeof c2 ? w2 = c2(e2, w2) : w2 instanceof Date ? w2 = p2(w2) : "comma" === o2 && v(w2) && (w2 = m(w2, function(t4) {
    return t4 instanceof Date ? p2(t4) : t4;
  })), null === w2) {
    if (i2) return l2 && !h2 ? l2(e2, O.encoder, b2, "key", y2) : e2;
    w2 = "";
  }
  if ("string" == typeof (I2 = w2) || "number" == typeof I2 || "boolean" == typeof I2 || "symbol" == typeof I2 || "bigint" == typeof I2 || (function(t4) {
    return !(!t4 || "object" != typeof t4 || !(t4.constructor && t4.constructor.isBuffer && t4.constructor.isBuffer(t4)));
  })(w2)) return l2 ? [d2(h2 ? e2 : l2(e2, O.encoder, b2, "key", y2)) + "=" + d2(l2(w2, O.encoder, b2, "value", y2))] : [d2(e2) + "=" + d2(String(w2))];
  var I2;
  const S2 = [];
  if (void 0 === w2) return S2;
  let A2;
  if ("comma" === o2 && v(w2)) h2 && l2 && (w2 = m(w2, l2)), A2 = [{ value: w2.length > 0 ? w2.join(",") || null : void 0 }];
  else if (v(c2)) A2 = c2;
  else {
    const t4 = Object.keys(w2);
    A2 = a2 ? t4.sort(a2) : t4;
  }
  const D2 = u2 ? e2.replace(/\./g, "%2E") : e2, k2 = n2 && v(w2) && 1 === w2.length ? D2 + "[]" : D2;
  if (r2 && v(w2) && 0 === w2.length) return k2 + "[]";
  for (let e3 = 0; e3 < A2.length; ++e3) {
    const m2 = A2[e3], j3 = "object" == typeof m2 && void 0 !== m2.value ? m2.value : w2[m2];
    if (s2 && null === j3) continue;
    const O2 = f2 && u2 ? m2.replace(/\./g, "%2E") : m2, _3 = v(w2) ? "function" == typeof o2 ? o2(k2, O2) : k2 : k2 + (f2 ? "." + O2 : "[" + O2 + "]");
    g2.set(t3, E2);
    const I3 = /* @__PURE__ */ new WeakMap();
    I3.set(T, g2), $(S2, R(j3, _3, o2, n2, r2, i2, s2, u2, "comma" === o2 && h2 && v(w2) ? null : l2, c2, a2, f2, p2, y2, d2, h2, b2, I3));
  }
  return S2;
}, _ = Object.prototype.hasOwnProperty, I = Array.isArray, S = { allowDots: false, allowEmptyArrays: false, allowPrototypes: false, allowSparse: false, arrayLimit: 20, charset: "utf-8", charsetSentinel: false, comma: false, decodeDotInKeys: false, decoder: function(t3, e2, o2) {
  const n2 = t3.replace(/\+/g, " ");
  if ("iso-8859-1" === o2) return n2.replace(/%[0-9a-f]{2}/gi, unescape);
  try {
    return decodeURIComponent(n2);
  } catch (t4) {
    return n2;
  }
}, delimiter: "&", depth: 5, duplicates: "combine", ignoreQueryPrefix: false, interpretNumericEntities: false, parameterLimit: 1e3, parseArrays: true, plainObjects: false, strictNullHandling: false }, A = function(t3) {
  return t3.replace(/&#(\d+);/g, function(t4, e2) {
    return String.fromCharCode(parseInt(e2, 10));
  });
}, D = function(t3, e2) {
  return t3 && "string" == typeof t3 && e2.comma && t3.indexOf(",") > -1 ? t3.split(",") : t3;
}, k = function(t3, e2, o2, n2) {
  if (!t3) return;
  const r2 = o2.allowDots ? t3.replace(/\.([^.[]+)/g, "[$1]") : t3, i2 = /(\[[^[\]]*])/g;
  let s2 = o2.depth > 0 && /(\[[^[\]]*])/.exec(r2);
  const u2 = s2 ? r2.slice(0, s2.index) : r2, l2 = [];
  if (u2) {
    if (!o2.plainObjects && _.call(Object.prototype, u2) && !o2.allowPrototypes) return;
    l2.push(u2);
  }
  let a2 = 0;
  for (; o2.depth > 0 && null !== (s2 = i2.exec(r2)) && a2 < o2.depth; ) {
    if (a2 += 1, !o2.plainObjects && _.call(Object.prototype, s2[1].slice(1, -1)) && !o2.allowPrototypes) return;
    l2.push(s2[1]);
  }
  return s2 && l2.push("[" + r2.slice(s2.index) + "]"), (function(t4, e3, o3, n3) {
    let r3 = n3 ? e3 : D(e3, o3);
    for (let e4 = t4.length - 1; e4 >= 0; --e4) {
      let n4;
      const i3 = t4[e4];
      if ("[]" === i3 && o3.parseArrays) n4 = c(r3) ? r3 : o3.allowEmptyArrays && ("" === r3 || o3.strictNullHandling && null === r3) ? [] : b([], r3, o3.arrayLimit, o3.plainObjects);
      else {
        n4 = o3.plainObjects ? /* @__PURE__ */ Object.create(null) : {};
        const t5 = "[" === i3.charAt(0) && "]" === i3.charAt(i3.length - 1) ? i3.slice(1, -1) : i3, e5 = o3.decodeDotInKeys ? t5.replace(/%2E/g, ".") : t5, s3 = parseInt(e5, 10);
        o3.parseArrays || "" !== e5 ? !isNaN(s3) && i3 !== e5 && String(s3) === e5 && s3 >= 0 && o3.parseArrays && s3 <= o3.arrayLimit ? (n4 = [], n4[s3] = r3) : "__proto__" !== e5 && (n4[e5] = r3) : n4 = { 0: r3 };
      }
      r3 = n4;
    }
    return r3;
  })(l2, e2, o2, n2);
};
function N(t3, e2) {
  const o2 = /* @__PURE__ */ (function(t4) {
    return S;
  })();
  if ("" === t3 || null == t3) return o2.plainObjects ? /* @__PURE__ */ Object.create(null) : {};
  const n2 = "string" == typeof t3 ? (function(t4, e3) {
    const o3 = { __proto__: null }, n3 = (e3.ignoreQueryPrefix ? t4.replace(/^\?/, "") : t4).split(e3.delimiter, Infinity === e3.parameterLimit ? void 0 : e3.parameterLimit);
    let r3, i3 = -1, s2 = e3.charset;
    if (e3.charsetSentinel) for (r3 = 0; r3 < n3.length; ++r3) 0 === n3[r3].indexOf("utf8=") && ("utf8=%E2%9C%93" === n3[r3] ? s2 = "utf-8" : "utf8=%26%2310003%3B" === n3[r3] && (s2 = "iso-8859-1"), i3 = r3, r3 = n3.length);
    for (r3 = 0; r3 < n3.length; ++r3) {
      if (r3 === i3) continue;
      const t5 = n3[r3], u2 = t5.indexOf("]="), l2 = -1 === u2 ? t5.indexOf("=") : u2 + 1;
      let c2, a2;
      -1 === l2 ? (c2 = e3.decoder(t5, S.decoder, s2, "key"), a2 = e3.strictNullHandling ? null : "") : (c2 = e3.decoder(t5.slice(0, l2), S.decoder, s2, "key"), a2 = m(D(t5.slice(l2 + 1), e3), function(t6) {
        return e3.decoder(t6, S.decoder, s2, "value");
      })), a2 && e3.interpretNumericEntities && "iso-8859-1" === s2 && (a2 = A(a2)), t5.indexOf("[]=") > -1 && (a2 = I(a2) ? [a2] : a2);
      const f2 = _.call(o3, c2);
      f2 && "combine" === e3.duplicates ? o3[c2] = b(o3[c2], a2, e3.arrayLimit, e3.plainObjects) : f2 && "last" !== e3.duplicates || (o3[c2] = a2);
    }
    return o3;
  })(t3, o2) : t3;
  let r2 = o2.plainObjects ? /* @__PURE__ */ Object.create(null) : {};
  const i2 = Object.keys(n2);
  for (let e3 = 0; e3 < i2.length; ++e3) {
    const s2 = i2[e3], u2 = k(s2, n2[s2], o2, "string" == typeof t3);
    r2 = d(r2, u2, o2);
  }
  return true === o2.allowSparse ? r2 : (function(t4) {
    const e3 = [{ obj: { o: t4 }, prop: "o" }], o3 = [];
    for (let t5 = 0; t5 < e3.length; ++t5) {
      const n3 = e3[t5], r3 = n3.obj[n3.prop], i3 = Object.keys(r3);
      for (let t6 = 0; t6 < i3.length; ++t6) {
        const n4 = i3[t6], s2 = r3[n4];
        "object" == typeof s2 && null !== s2 && -1 === o3.indexOf(s2) && (e3.push({ obj: r3, prop: n4 }), o3.push(s2));
      }
    }
    return (function(t5) {
      for (; t5.length > 1; ) {
        const e4 = t5.pop(), o4 = e4.obj[e4.prop];
        if (s(o4)) {
          const t6 = [];
          for (let e5 = 0; e5 < o4.length; ++e5) void 0 !== o4[e5] && t6.push(o4[e5]);
          e4.obj[e4.prop] = t6;
        }
      }
    })(e3), t4;
  })(r2);
}
class x {
  constructor(t3, e2, o2) {
    var n2, r2;
    this.name = t3, this.definition = e2, this.bindings = null != (n2 = e2.bindings) ? n2 : {}, this.wheres = null != (r2 = e2.wheres) ? r2 : {}, this.config = o2;
  }
  get template() {
    const t3 = `${this.origin}/${this.definition.uri}`.replace(/\/+$/, "");
    return "" === t3 ? "/" : t3;
  }
  get origin() {
    return this.config.absolute ? this.definition.domain ? `${this.config.url.match(/^\w+:\/\//)[0]}${this.definition.domain}${this.config.port ? `:${this.config.port}` : ""}` : this.config.url : "";
  }
  get parameterSegments() {
    var t3, e2;
    return null != (t3 = null == (e2 = this.template.match(/{[^}?]+\??}/g)) ? void 0 : e2.map((t4) => ({ name: t4.replace(/{|\??}/g, ""), required: !/\?}$/.test(t4) }))) ? t3 : [];
  }
  matchesUrl(t3) {
    var e2;
    if (!this.definition.methods.includes("GET")) return false;
    const o2 = this.template.replace(/[.*+$()[\]]/g, "\\$&").replace(/(\/?){([^}?]*)(\??)}/g, (t4, e3, o3, n3) => {
      var r3;
      const i3 = `(?<${o3}>${(null == (r3 = this.wheres[o3]) ? void 0 : r3.replace(/(^\^)|(\$$)/g, "")) || "[^/?]+"})`;
      return n3 ? `(${e3}${i3})?` : `${e3}${i3}`;
    }).replace(/^\w+:\/\//, ""), [n2, r2] = t3.replace(/^\w+:\/\//, "").split("?"), i2 = null != (e2 = new RegExp(`^${o2}/?$`).exec(n2)) ? e2 : new RegExp(`^${o2}/?$`).exec(decodeURI(n2));
    if (i2) {
      for (const t4 in i2.groups) i2.groups[t4] = "string" == typeof i2.groups[t4] ? decodeURIComponent(i2.groups[t4]) : i2.groups[t4];
      return { params: i2.groups, query: N(r2) };
    }
    return false;
  }
  compile(t3) {
    return this.parameterSegments.length ? this.template.replace(/{([^}?]+)(\??)}/g, (e2, o2, n2) => {
      var r2, i2;
      if (!n2 && [null, void 0].includes(t3[o2])) throw new Error(`Ziggy error: '${o2}' parameter is required for route '${this.name}'.`);
      if (this.wheres[o2] && !new RegExp(`^${n2 ? `(${this.wheres[o2]})?` : this.wheres[o2]}$`).test(null != (i2 = t3[o2]) ? i2 : "")) throw new Error(`Ziggy error: '${o2}' parameter '${t3[o2]}' does not match required format '${this.wheres[o2]}' for route '${this.name}'.`);
      return encodeURI(null != (r2 = t3[o2]) ? r2 : "").replace(/%7C/g, "|").replace(/%25/g, "%").replace(/\$/g, "%24");
    }).replace(this.config.absolute ? /(\.[^/]+?)(\/\/)/ : /(^)(\/\/)/, "$1/").replace(/\/+$/, "") : this.template;
  }
}
class C extends String {
  constructor(e2, o2, n2 = true, r2) {
    if (super(), this.t = null != r2 ? r2 : "undefined" != typeof Ziggy ? Ziggy : null == globalThis ? void 0 : globalThis.Ziggy, !this.t && "undefined" != typeof document && document.getElementById("ziggy-routes-json") && (globalThis.Ziggy = JSON.parse(document.getElementById("ziggy-routes-json").textContent), this.t = globalThis.Ziggy), this.t = t({}, this.t, { absolute: n2 }), e2) {
      if (!this.t.routes[e2]) throw new Error(`Ziggy error: route '${e2}' is not in the route list.`);
      this.i = new x(e2, this.t.routes[e2], this.t), this.u = this.l(o2);
    }
  }
  toString() {
    const e2 = Object.keys(this.u).filter((t3) => !this.i.parameterSegments.some(({ name: e3 }) => e3 === t3)).filter((t3) => "_query" !== t3).reduce((e3, o2) => t({}, e3, { [o2]: this.u[o2] }), {});
    return this.i.compile(this.u) + (function(t3, e3) {
      let o2 = t3;
      const i2 = (function(t4) {
        if (!t4) return O;
        if (void 0 !== t4.allowEmptyArrays && "boolean" != typeof t4.allowEmptyArrays) throw new TypeError("`allowEmptyArrays` option can only be `true` or `false`, when provided");
        if (void 0 !== t4.encodeDotInKeys && "boolean" != typeof t4.encodeDotInKeys) throw new TypeError("`encodeDotInKeys` option can only be `true` or `false`, when provided");
        if (null != t4.encoder && "function" != typeof t4.encoder) throw new TypeError("Encoder has to be a function.");
        const e4 = t4.charset || O.charset;
        if (void 0 !== t4.charset && "utf-8" !== t4.charset && "iso-8859-1" !== t4.charset) throw new TypeError("The charset option must be either utf-8, iso-8859-1, or undefined");
        let o3 = r;
        if (void 0 !== t4.format) {
          if (!g.call(n, t4.format)) throw new TypeError("Unknown format option provided.");
          o3 = t4.format;
        }
        const i3 = n[o3];
        let s3, u3 = O.filter;
        if (("function" == typeof t4.filter || v(t4.filter)) && (u3 = t4.filter), s3 = t4.arrayFormat in w ? t4.arrayFormat : "indices" in t4 ? t4.indices ? "indices" : "repeat" : O.arrayFormat, "commaRoundTrip" in t4 && "boolean" != typeof t4.commaRoundTrip) throw new TypeError("`commaRoundTrip` must be a boolean, or absent");
        return { addQueryPrefix: "boolean" == typeof t4.addQueryPrefix ? t4.addQueryPrefix : O.addQueryPrefix, allowDots: void 0 === t4.allowDots ? true === t4.encodeDotInKeys || O.allowDots : !!t4.allowDots, allowEmptyArrays: "boolean" == typeof t4.allowEmptyArrays ? !!t4.allowEmptyArrays : O.allowEmptyArrays, arrayFormat: s3, charset: e4, charsetSentinel: "boolean" == typeof t4.charsetSentinel ? t4.charsetSentinel : O.charsetSentinel, commaRoundTrip: t4.commaRoundTrip, delimiter: void 0 === t4.delimiter ? O.delimiter : t4.delimiter, encode: "boolean" == typeof t4.encode ? t4.encode : O.encode, encodeDotInKeys: "boolean" == typeof t4.encodeDotInKeys ? t4.encodeDotInKeys : O.encodeDotInKeys, encoder: "function" == typeof t4.encoder ? t4.encoder : O.encoder, encodeValuesOnly: "boolean" == typeof t4.encodeValuesOnly ? t4.encodeValuesOnly : O.encodeValuesOnly, filter: u3, format: o3, formatter: i3, serializeDate: "function" == typeof t4.serializeDate ? t4.serializeDate : O.serializeDate, skipNulls: "boolean" == typeof t4.skipNulls ? t4.skipNulls : O.skipNulls, sort: "function" == typeof t4.sort ? t4.sort : null, strictNullHandling: "boolean" == typeof t4.strictNullHandling ? t4.strictNullHandling : O.strictNullHandling };
      })(e3);
      let s2, u2;
      "function" == typeof i2.filter ? (u2 = i2.filter, o2 = u2("", o2)) : v(i2.filter) && (u2 = i2.filter, s2 = u2);
      const l2 = [];
      if ("object" != typeof o2 || null === o2) return "";
      const c2 = w[i2.arrayFormat], a2 = "comma" === c2 && i2.commaRoundTrip;
      s2 || (s2 = Object.keys(o2)), i2.sort && s2.sort(i2.sort);
      const f2 = /* @__PURE__ */ new WeakMap();
      for (let t4 = 0; t4 < s2.length; ++t4) {
        const e4 = s2[t4];
        i2.skipNulls && null === o2[e4] || $(l2, R(o2[e4], e4, c2, a2, i2.allowEmptyArrays, i2.strictNullHandling, i2.skipNulls, i2.encodeDotInKeys, i2.encode ? i2.encoder : null, i2.filter, i2.sort, i2.allowDots, i2.serializeDate, i2.format, i2.formatter, i2.encodeValuesOnly, i2.charset, f2));
      }
      const p2 = l2.join(i2.delimiter);
      let y2 = true === i2.addQueryPrefix ? "?" : "";
      return i2.charsetSentinel && (y2 += "iso-8859-1" === i2.charset ? "utf8=%26%2310003%3B&" : "utf8=%E2%9C%93&"), p2.length > 0 ? y2 + p2 : "";
    })(t({}, e2, this.u._query), { addQueryPrefix: true, arrayFormat: "indices", encodeValuesOnly: true, skipNulls: true, encoder: (t3, e3) => "boolean" == typeof t3 ? Number(t3) : e3(t3) });
  }
  p(e2) {
    e2 ? this.t.absolute && e2.startsWith("/") && (e2 = this.h().host + e2) : e2 = this.m();
    let o2 = {};
    const [n2, r2] = Object.entries(this.t.routes).find(([t3, n3]) => o2 = new x(t3, n3, this.t).matchesUrl(e2)) || [void 0, void 0];
    return t({ name: n2 }, o2, { route: r2 });
  }
  m() {
    const { host: t3, pathname: e2, search: o2 } = this.h();
    return (this.t.absolute ? t3 + e2 : e2.replace(this.t.url.replace(/^\w*:\/\/[^/]+/, ""), "").replace(/^\/+/, "/")) + o2;
  }
  current(e2, o2) {
    const { name: n2, params: r2, query: i2, route: s2 } = this.p();
    if (!e2) return n2;
    const u2 = new RegExp(`^${e2.replace(/\./g, "\\.").replace(/\*/g, ".*")}$`).test(n2);
    if ([null, void 0].includes(o2) || !u2) return u2;
    const l2 = new x(n2, s2, this.t);
    o2 = this.l(o2, l2);
    const c2 = t({}, r2, i2);
    if (Object.values(o2).every((t3) => !t3) && !Object.values(c2).some((t3) => void 0 !== t3)) return true;
    const a2 = (t3, e3) => Object.entries(t3).every(([t4, o3]) => Array.isArray(o3) && Array.isArray(e3[t4]) ? o3.every((o4) => e3[t4].includes(o4) || e3[t4].includes(decodeURIComponent(o4))) : "object" == typeof o3 && "object" == typeof e3[t4] && null !== o3 && null !== e3[t4] ? a2(o3, e3[t4]) : e3[t4] == o3 || e3[t4] == decodeURIComponent(o3));
    return a2(o2, c2);
  }
  h() {
    var t3, e2, o2, n2, r2, i2;
    const { host: s2 = "", pathname: u2 = "", search: l2 = "" } = "undefined" != typeof window ? window.location : {};
    return { host: null != (t3 = null == (e2 = this.t.location) ? void 0 : e2.host) ? t3 : s2, pathname: null != (o2 = null == (n2 = this.t.location) ? void 0 : n2.pathname) ? o2 : u2, search: null != (r2 = null == (i2 = this.t.location) ? void 0 : i2.search) ? r2 : l2 };
  }
  get params() {
    const { params: e2, query: o2 } = this.p();
    return t({}, e2, o2);
  }
  get routeParams() {
    return this.p().params;
  }
  get queryParams() {
    return this.p().query;
  }
  has(t3) {
    return this.t.routes.hasOwnProperty(t3);
  }
  l(e2 = {}, o2 = this.i) {
    null != e2 || (e2 = {}), e2 = ["string", "number"].includes(typeof e2) ? [e2] : e2;
    const n2 = o2.parameterSegments.filter(({ name: t3 }) => !this.t.defaults[t3]);
    return Array.isArray(e2) ? e2 = e2.reduce((e3, o3, r2) => t({}, e3, n2[r2] ? { [n2[r2].name]: o3 } : "object" == typeof o3 ? o3 : { [o3]: "" }), {}) : 1 !== n2.length || e2.hasOwnProperty(n2[0].name) || !e2.hasOwnProperty(Object.values(o2.bindings)[0]) && !e2.hasOwnProperty("id") || (e2 = { [n2[0].name]: e2 }), t({}, this.v(o2), this.j(e2, o2));
  }
  v(e2) {
    return e2.parameterSegments.filter(({ name: t3 }) => this.t.defaults[t3]).reduce((e3, { name: o2 }, n2) => t({}, e3, { [o2]: this.t.defaults[o2] }), {});
  }
  j(e2, { bindings: o2, parameterSegments: n2 }) {
    return Object.entries(e2).reduce((e3, [r2, i2]) => {
      if (!i2 || "object" != typeof i2 || Array.isArray(i2) || !n2.some(({ name: t3 }) => t3 === r2)) return t({}, e3, { [r2]: i2 });
      const s2 = i2.hasOwnProperty(o2[r2]) ? o2[r2] : i2.hasOwnProperty("id") ? "id" : void 0;
      if (void 0 === s2) throw new Error(`Ziggy error: object passed as '${r2}' parameter is missing route model binding key '${o2[r2]}'.`);
      return t({}, e3, { [r2]: i2[s2] });
    }, {});
  }
  valueOf() {
    return this.toString();
  }
}
function P(t3, e2, o2, n2) {
  const r2 = new C(t3, e2, o2, n2);
  return t3 ? r2.toString() : r2;
}
const U = { install(t3, e2) {
  const o2 = (t4, o3, n2, r2 = e2) => P(t4, o3, n2, r2);
  parseInt(t3.version) > 2 ? (t3.config.globalProperties.route = o2, t3.provide("route", o2)) : t3.mixin({ methods: { route: o2 } });
} };
createServer(
  (page) => createInertiaApp({
    page,
    render: renderToString,
    title: (title) => `${title}`,
    resolve: (name) => resolvePageComponent(`./Pages/${name}.vue`, /* @__PURE__ */ Object.assign({ "./Pages/Auth/ForgotPassword.vue": () => import("./assets/ForgotPassword-48YD-3Mn.js"), "./Pages/Auth/ForgotPasswordInput.vue": () => import("./assets/ForgotPasswordInput-BjVZZUKe.js"), "./Pages/Auth/Login-last-backup.vue": () => import("./assets/Login-last-backup-DKiOxqPF.js"), "./Pages/Auth/Login.vue": () => import("./assets/Login-Cobs3R5o.js"), "./Pages/Auth/Register.vue": () => import("./assets/Register-DmOqxOJ-.js"), "./Pages/Dashboard/Index.vue": () => import("./assets/Index-CXI-Kytf.js"), "./Pages/EmailTemplates/Edit.vue": () => import("./assets/Edit-D-8Tuu5S.js"), "./Pages/EmailTemplates/Index.vue": () => import("./assets/Index-DNLc3Pme.js"), "./Pages/Error.vue": () => import("./assets/Error-CvBL8nAc.js"), "./Pages/Installer/Index.vue": () => import("./assets/Index-lwTWRw6q.js"), "./Pages/Installer/Steps/Admin.vue": () => import("./assets/Admin-BY6XqAys.js"), "./Pages/Installer/Steps/Complete.vue": () => import("./assets/Complete-B7-8BqnV.js"), "./Pages/Installer/Steps/Database.vue": () => import("./assets/Database-CaDizekc.js"), "./Pages/Installer/Steps/Environment.vue": () => import("./assets/Environment-B9VIwaWc.js"), "./Pages/Installer/Steps/License.vue": () => import("./assets/License-BTTvQ5mb.js"), "./Pages/Installer/Steps/Progress.vue": () => import("./assets/Progress-BEqXIgcf.js"), "./Pages/Installer/Steps/Welcome.vue": () => import("./assets/Welcome-BbNVvZOY.js"), "./Pages/Labels/Create.vue": () => import("./assets/Create-C4DBnaDD.js"), "./Pages/Labels/Edit.vue": () => import("./assets/Edit-BVnghXKE.js"), "./Pages/Labels/Index.vue": () => import("./assets/Index-D2bB1r4G.js"), "./Pages/Languages/Create.vue": () => import("./assets/Create-D1u7fxOP.js"), "./Pages/Languages/Edit.vue": () => import("./assets/Edit-DXnKN-ib.js"), "./Pages/Languages/Index.vue": () => import("./assets/Index-CBtJAtIt.js"), "./Pages/Notifications/Index.vue": () => import("./assets/Index-DHzdS1bB.js"), "./Pages/Projects/Calendar.vue": () => import("./assets/Calendar-Y5AAk8_O.js"), "./Pages/Projects/Calendar_Clean.vue": () => import("./assets/Calendar_Clean-5Jk8l8rj.js"), "./Pages/Projects/Dashboard.vue": () => import("./assets/Dashboard-BcldIGvc.js"), "./Pages/Projects/GanttChart.vue": () => import("./assets/GanttChart-BFTuSW4L.js"), "./Pages/Projects/Index.vue": () => import("./assets/Index-BEhNWKnH.js"), "./Pages/Projects/Na.vue": () => import("./assets/Na-CJkhuclU.js"), "./Pages/Projects/Table.vue": () => import("./assets/Table-CU5CC4Tm.js"), "./Pages/Projects/Timeline.vue": () => import("./assets/Timeline-BgfgDb_G.js"), "./Pages/Projects/Timer.vue": () => import("./assets/Timer-CJu-tbs0.js"), "./Pages/Projects/View.vue": () => import("./assets/View-CvPQ-4TC.js"), "./Pages/Roles/Create.vue": () => import("./assets/Create-BNRecLhh.js"), "./Pages/Roles/Edit.vue": () => import("./assets/Edit-DXacNQXL.js"), "./Pages/Roles/Index.vue": () => import("./assets/Index-qFlmCWzy.js"), "./Pages/Settings/Index.vue": () => import("./assets/Index-CluEi3N8.js"), "./Pages/Settings/Notification.vue": () => import("./assets/Notification-B0cUijsx.js"), "./Pages/Settings/NotificationSettings.vue": () => import("./assets/NotificationSettings-C3BLiH-d.js"), "./Pages/Settings/PreMadeList.vue": () => import("./assets/PreMadeList-DW_I7PRM.js"), "./Pages/Settings/Smtp.vue": () => import("./assets/Smtp-DlIi5Mu6.js"), "./Pages/Settings/Update.vue": () => import("./assets/Update-DLvSTh1q.js"), "./Pages/Users/Create.vue": () => import("./assets/Create-yZrt9jel.js"), "./Pages/Users/Edit.vue": () => import("./assets/Edit-koDeo6cv.js"), "./Pages/Users/EditProfile.vue": () => import("./assets/EditProfile-B5r4Rg52.js"), "./Pages/Users/Index.vue": () => import("./assets/Index-By2GvXyU.js"), "./Pages/WorkspaceTypes/Create.vue": () => import("./assets/Create-epqwq7uB.js"), "./Pages/WorkspaceTypes/Edit.vue": () => import("./assets/Edit-BXk22kQ1.js"), "./Pages/WorkspaceTypes/Index.vue": () => import("./assets/Index-CULifkb5.js"), "./Pages/Workspaces/Board.vue": () => import("./assets/Board-D57d6J0E.js"), "./Pages/Workspaces/Calendar.vue": () => import("./assets/Calendar-Cg9Zre6h.js"), "./Pages/Workspaces/Documentworkflow.vue": () => import("./assets/Documentworkflow-Dnj3zYD_.js"), "./Pages/Workspaces/MainDashboard.vue": () => import("./assets/MainDashboard-B0WbYRaX.js"), "./Pages/Workspaces/Members.vue": () => import("./assets/Members-BC-I2kGW.js"), "./Pages/Workspaces/MyTasks.vue": () => import("./assets/MyTasks-Cl6MZ5rF.js"), "./Pages/Workspaces/MyTasksBoard.vue": () => import("./assets/MyTasksBoard-By9BLigd.js"), "./Pages/Workspaces/MyTasksCalendar.vue": () => import("./assets/MyTasksCalendar-CmTaB4Zr.js"), "./Pages/Workspaces/MyTasksTimeline.vue": () => import("./assets/MyTasksTimeline-B6JJnwCb.js"), "./Pages/Workspaces/Table.vue": () => import("./assets/Table-DUSvKSq1.js"), "./Pages/Workspaces/Timeline.vue": () => import("./assets/Timeline-DLTINze0.js"), "./Pages/Workspaces/View.vue": () => import("./assets/View-TfdSdqPx.js") })),
    setup({ App, props, plugin }) {
      return createSSRApp({ render: () => h$1(App, props) }).use(plugin).use(U, {
        ...page.props.ziggy,
        location: new URL(page.props.ziggy.location)
      }).use(i18nVue, {
        lang: "pt",
        resolve: (lang) => {
          const langs = /* @__PURE__ */ Object.assign({ "../../lang/cn.json": __vite_glob_1_0, "../../lang/en.json": __vite_glob_1_1, "../../lang/kh.json": __vite_glob_1_2, "../../lang/php_en.json": __vite_glob_1_3 });
          return langs[`../../lang/${lang}.json`].default;
        }
      });
    }
  })
);
