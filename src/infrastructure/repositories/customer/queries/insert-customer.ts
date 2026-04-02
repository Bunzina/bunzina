export const INSERT_CUSTOMER = `
  INSERT INTO bunzina.customers (
    id,
    name,
    document,
    document_type,
    email,
    phone,
    address_street,
    address_number,
    address_city,
    address_state,
    address_zip_code,
    address_neighborhood,
    address_complement,
    created_at,
    updated_at
  ) VALUES (
    :id,
    :name,
    :document,
    :document_type,
    :email,
    :phone,
    :address_street,
    :address_number,
    :address_city,
    :address_state,
    :address_zip_code,
    :address_neighborhood,
    :address_complement,
    :created_at,
    :updated_at
  )
`;
