import { onRequestGet as __api_payments_stats_js_onRequestGet } from "C:\\Users\\Administrator\\Downloads\\air-bill-pwa\\functions\\api\\payments\\stats.js"
import { onRequestDelete as __api_payments__id__js_onRequestDelete } from "C:\\Users\\Administrator\\Downloads\\air-bill-pwa\\functions\\api\\payments\\[id].js"
import { onRequestPut as __api_payments__id__js_onRequestPut } from "C:\\Users\\Administrator\\Downloads\\air-bill-pwa\\functions\\api\\payments\\[id].js"
import { onRequestDelete as __api_people__id__js_onRequestDelete } from "C:\\Users\\Administrator\\Downloads\\air-bill-pwa\\functions\\api\\people\\[id].js"
import { onRequestPut as __api_people__id__js_onRequestPut } from "C:\\Users\\Administrator\\Downloads\\air-bill-pwa\\functions\\api\\people\\[id].js"
import { onRequestGet as __api_payments_index_js_onRequestGet } from "C:\\Users\\Administrator\\Downloads\\air-bill-pwa\\functions\\api\\payments\\index.js"
import { onRequestPost as __api_payments_index_js_onRequestPost } from "C:\\Users\\Administrator\\Downloads\\air-bill-pwa\\functions\\api\\payments\\index.js"
import { onRequestGet as __api_people_index_js_onRequestGet } from "C:\\Users\\Administrator\\Downloads\\air-bill-pwa\\functions\\api\\people\\index.js"
import { onRequestPost as __api_people_index_js_onRequestPost } from "C:\\Users\\Administrator\\Downloads\\air-bill-pwa\\functions\\api\\people\\index.js"

export const routes = [
    {
      routePath: "/api/payments/stats",
      mountPath: "/api/payments",
      method: "GET",
      middlewares: [],
      modules: [__api_payments_stats_js_onRequestGet],
    },
  {
      routePath: "/api/payments/:id",
      mountPath: "/api/payments",
      method: "DELETE",
      middlewares: [],
      modules: [__api_payments__id__js_onRequestDelete],
    },
  {
      routePath: "/api/payments/:id",
      mountPath: "/api/payments",
      method: "PUT",
      middlewares: [],
      modules: [__api_payments__id__js_onRequestPut],
    },
  {
      routePath: "/api/people/:id",
      mountPath: "/api/people",
      method: "DELETE",
      middlewares: [],
      modules: [__api_people__id__js_onRequestDelete],
    },
  {
      routePath: "/api/people/:id",
      mountPath: "/api/people",
      method: "PUT",
      middlewares: [],
      modules: [__api_people__id__js_onRequestPut],
    },
  {
      routePath: "/api/payments",
      mountPath: "/api/payments",
      method: "GET",
      middlewares: [],
      modules: [__api_payments_index_js_onRequestGet],
    },
  {
      routePath: "/api/payments",
      mountPath: "/api/payments",
      method: "POST",
      middlewares: [],
      modules: [__api_payments_index_js_onRequestPost],
    },
  {
      routePath: "/api/people",
      mountPath: "/api/people",
      method: "GET",
      middlewares: [],
      modules: [__api_people_index_js_onRequestGet],
    },
  {
      routePath: "/api/people",
      mountPath: "/api/people",
      method: "POST",
      middlewares: [],
      modules: [__api_people_index_js_onRequestPost],
    },
  ]