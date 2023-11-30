const Bot = () => import('@chatbot/views/bot/index.vue')
const Intention = () => import('@/projects/chatbot/views/intention/index.vue')
const Response = () => import('@/projects/chatbot/views/response/index.vue')
const Story = () => import('@/projects/chatbot/views/story/index.vue')

const routerPrefix = 'chatbot'

export const frameRouter = [
    {
        path: `/${routerPrefix}/index`,
        name: 'Bot',
        component: Bot,
        meta: {
            title: '子应用'
        }
    },
    {
        path: `/${routerPrefix}/intention`,
        name: 'Intention',
        component: Intention,
        meta: {
            title: 'intention'
        }
    },
    {
        path: `/${routerPrefix}/response`,
        name: 'Response',
        component: Response,
        meta: {
            title: 'response'
        }
    },
    {
        path: `/${routerPrefix}/story`,
        name: 'Story',
        component: Story
    }
]

export const adminRouteConfig = [
    {
        name: 'bot',
        id: 'BotApp',
        children: [
            {
                name: 'bot创建',
                id: 'Bot'
            },
            {
                name: '意图',
                id: 'Intention'
            },
            {
                name: '响应',
                id: 'Response'
            },
            {
                name: '故事',
                id: 'Story'
            }
        ]
    }
]

export const createAdminRouteConfig = () => adminRouteConfig
