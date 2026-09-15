INSERT INTO bunzina.users (
  id,
  name,
  document,
  email,
  password_hash,
  role
)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'bunzina-admin',
  '11144477735',
  'bunzina@email.com',
  '$argon2id$v=19$m=65536,t=2,p=1$bjNbAXHqRMHtgUVJ9OlPT1kRqfe/nv3ptBYULU+6clE$oZnjxIOgOAjJtwvRwLzzZ96SimJTGeFAjov6HkbsjXY',
  'ADMIN'
)
ON CONFLICT (email) DO NOTHING;