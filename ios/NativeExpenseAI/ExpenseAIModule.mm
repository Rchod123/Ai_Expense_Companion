//
//  NativeExpenseAIModule.m
//  Ai_Expense_Companion
//
//  Created by Rajesh C on 22/09/26.
//

#import "ExpenseAIModule.h"
#import <React_RCTAppDelegate/RCTDefaultReactNativeFactoryDelegate.h>
#import "Ai_Expense_Companion-Swift.h"

@implementation ExpenseAIModule

- (std::shared_ptr<facebook::react::TurboModule>)getTurboModule:
    (const facebook::react::ObjCTurboModule::InitParams &)params
{
    return std::make_shared<
        facebook::react::NativeExpenseAISpecJSI
    >(params);
}

- (void)predict:(NSString *)description
        resolve:(RCTPromiseResolveBlock)resolve
         reject:(RCTPromiseRejectBlock)reject
{
    NSLog(@"[ExpenseAI iOS] Received: %@", description);

    NSError *error = nil;
    NSDictionary *prediction = [[ExpenseAI shared] predict:description error:&error];
    if (prediction == nil) {
        reject(@"EXPENSE_AI_ERROR", error.localizedDescription, error);
        return;
    }
    resolve(prediction);
}

+ (NSString *)moduleName
{
    return @"NativeExpenseAI";
}

@end
