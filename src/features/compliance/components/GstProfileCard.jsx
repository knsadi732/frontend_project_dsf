import { BaseCard, CardHeader, CardBody } from '@/components/ui/BaseCard';

export function GstProfileCard({ profile, isLoading }) {
  return (
    <BaseCard>
      <CardHeader>
        <h3 className="text-sm font-semibold text-text">GST compliance profile</h3>
      </CardHeader>
      <CardBody>
        {isLoading ? (
          <p className="text-sm text-text-muted">Loading…</p>
        ) : (
          <dl className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <dt className="text-text-muted">GSTIN</dt>
              <dd className="font-medium text-text">{profile?.gstin ?? '—'}</dd>
            </div>
            <div>
              <dt className="text-text-muted">Legal name</dt>
              <dd className="font-medium text-text">{profile?.legalName ?? '—'}</dd>
            </div>
          </dl>
        )}
      </CardBody>
    </BaseCard>
  );
}
