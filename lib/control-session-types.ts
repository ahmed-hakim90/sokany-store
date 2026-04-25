/**
 * ادّعاءات جلسة لوحة التحكم (نسخة موحّدة للبناء والعميل عبر ‎`GET /api/control/session`‎).
 */
export type ControlSessionPayload = {
  uid: string;
  scope: "full" | "media";
  /** ‎`access`‎ يضاف فقط لـ ‎`superAdmin`‎ في الواجهة. */
  tabs: "all" | string[];
  mediaFolders: "all" | string[];
  superAdmin: boolean;
};
