package com.expensecompanion.ai

import com.facebook.react.TurboReactPackage
import com.facebook.react.bridge.NativeModule
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.module.model.ReactModuleInfo
import com.facebook.react.module.model.ReactModuleInfoProvider

class ExpenseAIPackage : TurboReactPackage() {

    override fun getModule(
        name: String,
        reactContext: ReactApplicationContext
    ): NativeModule? {

        return when (name) {
            ExpenseAIModule.NAME ->
                ExpenseAIModule(reactContext)

            else ->
                null
        }
    }

    override fun getReactModuleInfoProvider(): ReactModuleInfoProvider {

        return ReactModuleInfoProvider {

            mapOf(
                ExpenseAIModule.NAME to ReactModuleInfo(
                    ExpenseAIModule.NAME,
                    ExpenseAIModule::class.java.name,
                    false, // canOverrideExistingModule
                    false, // needsEagerInit
                    false, // isCxxModule
                    true   // isTurboModule
                )
            )
        }
    }
}