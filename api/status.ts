import type { VercelRequest, VercelResponse } from '@vercel/node';

export default function handler(_req: VercelRequest, res: VercelResponse) {
  const hasJsonSa = Boolean(
    process.env.FIREBASE_SERVICE_ACCOUNT?.trim() ||
      process.env.FIREBASE_SERVICE_ACCOUNT_KEY?.trim() ||
      process.env.FIREBASE_KEY?.trim()
  );
  const hasSplitFirebase = Boolean(
    process.env.FIREBASE_PROJECT_ID &&
      process.env.FIREBASE_CLIENT_EMAIL &&
      process.env.FIREBASE_PRIVATE_KEY
  );

  res.status(200).json({
    status: 'ok',
    vercel: Boolean(process.env.VERCEL),
    env: {
      firebase_json: hasJsonSa,
      firebase_split: hasSplitFirebase,
      jwt_secret: Boolean(process.env.JWT_SECRET),
      admin_username: Boolean(process.env.ADMIN_USERNAME),
      admin_password: Boolean(process.env.ADMIN_PASSWORD),
    },
    note: 'Vercel hides secret values when you click Edit — empty field does NOT mean vars were deleted.',
  });
}
