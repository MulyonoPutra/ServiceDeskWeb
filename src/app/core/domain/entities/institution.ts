export interface IInstitution {
  id?: number;
  instanceName?: string;
  address?: string;
  contactNumber?: string;
}

export class Institution implements IInstitution {
  constructor(
    public id?: number,
    public instanceName?: string,
    public address?: string,
    public contactNumber?: string
  ) {}
}

export function getInstitutionIdentifier(
  institution: IInstitution
): number | undefined {
  return institution.id;
}
