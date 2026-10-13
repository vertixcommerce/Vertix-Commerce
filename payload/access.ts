import type { Access, FieldAccess, Where } from "payload";

type Role = "owner"|"administrator"|"editor"|"sales"|"support"|"viewer";
function roles(user: unknown): Role[]{
  if(!user||typeof user!=="object"||!("roles" in user)||!Array.isArray(user.roles)) return [];
  return user.roles as Role[];
}
export const authenticated: Access=({req})=>Boolean(req.user);
export const publicOrAuthenticated: Access=({req})=>req.user?true:{status:{equals:"published"}};
export const publishedOrAuthenticated: Access=({req})=>{
  if(req.user)return true;
  const where:Where={and:[{status:{equals:"published"}},{_status:{equals:"published"}}]};
  return where;
};
export const contentEditor: Access=({req})=>roles(req.user).some(r=>["owner","administrator","editor"].includes(r));
export const administrator: Access=({req})=>roles(req.user).some(r=>["owner","administrator"].includes(r));
export const selfOrAdministrator: Access=({req})=>administrator({req})===true?true:req.user?{id:{equals:req.user.id}}:false;
export const leadTeam: Access=({req})=>roles(req.user).some(r=>["owner","administrator","sales"].includes(r));
export const supportTeam: Access=({req})=>roles(req.user).some(r=>["owner","administrator","support"].includes(r));
export const ownerField: FieldAccess=({req})=>roles(req.user).includes("owner");
