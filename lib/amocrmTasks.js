// SERVER-ONLY. AmoCRM/Kommo Task API bilan ishlash uchun yordamchi.
// AMOCRM_SUBDOMAIN va AMOCRM_ACCESS_TOKEN (uzoq muddatli token) muhit
// o'zgaruvchilari orqali sozlanadi.

function getBaseUrl() {
  const subdomain = process.env.AMOCRM_SUBDOMAIN;
  if (!subdomain) throw new Error("AMOCRM_SUBDOMAIN sozlanmagan.");
  return `https://${subdomain}.kommo.com`;
}

async function amocrmFetch(path) {
  const token = process.env.AMOCRM_ACCESS_TOKEN;
  if (!token) throw new Error("AMOCRM_ACCESS_TOKEN sozlanmagan.");

  const res = await fetch(`${getBaseUrl()}${path}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
    },
  });

  if (res.status === 204) return { _embedded: { tasks: [] } };
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`AmoCRM API xatosi (${res.status}): ${text.slice(0, 300)}`);
  }
  return res.json();
}

// Berilgan AmoCRM foydalanuvchi ID'si uchun BAJARILMAGAN barcha
// vazifalarni oladi (sahifalab, hammasini yig'ib chiqadi).
async function fetchIncompleteTasks(amocrmUserId) {
  const tasks = [];
  let page = 1;
  const limit = 250;

  while (page <= 10) { // xavfsizlik uchun maksimal 10 sahifa (2500 ta vazifa)
    const path = `/api/v4/tasks?filter[is_completed]=0&filter[responsible_user_id][]=${amocrmUserId}&limit=${limit}&page=${page}`;
    const data = await amocrmFetch(path);
    const pageTasks = data?._embedded?.tasks || [];
    tasks.push(...pageTasks);
    if (pageTasks.length < limit) break;
    page += 1;
  }

  return tasks;
}

// Bitta operator uchun CRM nazorati mezonlarini tekshiradi:
// 1) 1 soatdan ortiq muddati o'tgan bajarilmagan vazifa bormi
// 2) Kelgusi (hali bajarilmagan) vazifa umuman bormi ("Next Task" bor-yo'qligi)
export async function evaluateCrmCompliance(amocrmUserId) {
  const tasks = await fetchIncompleteTasks(amocrmUserId);
  const nowSeconds = Math.floor(Date.now() / 1000);
  const oneHour = 60 * 60;

  const hasOverdueTask = tasks.some((t) => Number(t.complete_till) < nowSeconds - oneHour);
  const hasUpcomingTask = tasks.some((t) => Number(t.complete_till) >= nowSeconds - oneHour);

  const compliant = !hasOverdueTask && hasUpcomingTask;

  return {
    compliant,
    hasOverdueTask,
    hasUpcomingTask,
    totalIncompleteTasks: tasks.length,
  };
}
