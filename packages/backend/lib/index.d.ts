import * as functions from "firebase-functions/v1";
/**
 * Process new transactions and store in vector database
 */
export declare const processTransaction: functions.CloudFunction<functions.firestore.QueryDocumentSnapshot>;
/**
 * Natural language query processing
 */
export declare const processNaturalLanguageQuery: functions.HttpsFunction & functions.Runnable<any>;
/**
 * Generate financial insights
 */
export declare const generateFinancialInsights: functions.CloudFunction<unknown>;
/**
 * Create budget
 */
export declare const createBudget: functions.HttpsFunction & functions.Runnable<any>;
/**
 * Get budget progress
 */
export declare const getBudgetProgress: functions.HttpsFunction & functions.Runnable<any>;
