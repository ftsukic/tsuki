import { FixtureOverview } from '../../fixture-overview'
import GridActionExample from './examples/action-grid'
import GridBasicExample from './examples/basic'
import GridMemberExample from './examples/member-grid'

/**
 * @title Grid overview
 * @description Grid 提供 Vant Mobile 语义的图标、文字和成员操作网格。
 */
export default function GridOverview() {
  return (
    <FixtureOverview
      examples={[
        {
          Component: GridBasicExample,
          description: '展示基础的移动端图标文字网格。',
          id: 'basic',
          title: 'Basic Grid',
        },
        {
          Component: GridMemberExample,
          description: '展示群管理员、群成员、添加和删除操作。',
          id: 'member-grid',
          title: 'Member Grid',
        },
        {
          Component: GridActionExample,
          description: '展示聊天、文件、图片和链接等快捷操作。',
          id: 'action-grid',
          title: 'Action Grid',
        },
      ]}
      fullBleedExamples
    />
  )
}
