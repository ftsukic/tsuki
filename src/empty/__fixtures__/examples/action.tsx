import { Button, Empty, showToast } from '@ftsukic/tsuki'

/**
 * @title 带 Button 操作
 * @description children 会渲染在只负责间距布局的底部操作区域。
 */
export default function EmptyActionExample() {
  return (
    <Empty description="暂无数据">
      <Button
        type="primary"
        onPress={() => {
          showToast('普通提示')
        }}
      >
        刷新
      </Button>
    </Empty>
  )
}
