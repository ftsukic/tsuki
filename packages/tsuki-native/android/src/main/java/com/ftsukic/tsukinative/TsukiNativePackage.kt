package com.ftsukic.tsukinative

import com.facebook.react.ReactPackage
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.uimanager.ViewManager
import com.ftsukic.tsukinative.selectabletext.TsukiSelectableTextManager

class TsukiNativePackage : ReactPackage {
    override fun createViewManagers(reactContext: ReactApplicationContext): List<ViewManager<*, *>> = listOf(TsukiSelectableTextManager())
}
