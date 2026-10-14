import type { VercelRequest, VercelResponse } from '@vercel/node';

let inMemoryContact = {
  email: 'rohit007jsr@gmail.com',
  phone: '',
  whatsapp: '',
  facebook: '',
  youtube: '',
  tiktok: '',
  hours: '২৪/৭ সাপোর্ট',
};

export async function handleContactGetCore() {
  return {
    statusCode: 200,
    data: inMemoryContact,
  };
}

export async function handleContactPutCore(body: any) {
  if (body && typeof body === 'object') {
    inMemoryContact = {
      ...inMemoryContact,
      ...body,
    };
  }
  return {
    statusCode: 200,
    data: { success: true, contact: inMemoryContact },
  };
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'GET') {
    const result = await handleContactGetCore();
    return res.status(result.statusCode).json(result.data);
  }

  if (req.method === 'PUT') {
    const result = await handleContactPutCore(req.body || {});
    return res.status(result.statusCode).json(result.data);
  }

  res.setHeader('Allow', 'GET, PUT');
  return res.status(405).json({ error: 'Method Not Allowed' });
}
