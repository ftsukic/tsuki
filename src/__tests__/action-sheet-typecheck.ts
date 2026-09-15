import { showActionSheet } from '../action-sheet'

async function testActionSheetInference() {
  const emptyResult = await showActionSheet()
  void emptyResult

  const result = await showActionSheet({
    actions: [
      { name: '编辑', value: 'edit' as const },
      { name: '删除', value: 'delete' as const },
    ],
  })

  if (result) {
    const value: 'edit' | 'delete' = result.value
    void value
  }

  const resultWithId = await showActionSheet({
    actions: [
      { name: 'A', id: 1 as const },
      { name: 'B', id: 2 as const },
    ],
  })

  if (resultWithId) {
    const id: 1 | 2 = resultWithId.id
    void id
  }
}

void testActionSheetInference
