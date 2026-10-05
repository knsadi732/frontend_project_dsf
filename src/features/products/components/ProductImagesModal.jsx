import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AppModal } from '@/components/ui/AppModal';
import { AppButton } from '@/components/ui/AppButton';
import { AppSelect } from '@/components/ui/AppSelect';
import { AppInput } from '@/components/ui/AppInput';
import { documentApi } from '@/services/document.api';
import { productVariantApi } from '@/features/productVariants/api';
import { pushToast } from '@/utils/toastBus';

const IMAGE_ROLE_OPTIONS = [
  { value: 'thumbnail', label: 'Thumbnail (listing card)' },
  { value: 'front', label: 'Front view' },
  { value: 'side', label: 'Side view' },
  { value: 'back', label: 'Back view' },
  { value: 'top', label: 'Top view' },
  { value: 'gallery', label: 'Gallery' },
];

/**
 * Product images are tagged by color (so the color swatch on the product
 * page can swap the gallery) and by role (thumbnail/front/side/...). The
 * color dropdown is only the colors this product actually has variants in
 * — no free-text color, so an image can't be tagged with a color the
 * product doesn't sell.
 */
export function ProductImagesModal({ product, open, onClose }) {
  const queryClient = useQueryClient();
  const [file, setFile] = useState(null);
  const [color, setColor] = useState('');
  const [imageRole, setImageRole] = useState('gallery');

  const imagesKey = ['product-images', product?.id];

  const { data: images = [] } = useQuery({
    queryKey: imagesKey,
    queryFn: () => documentApi.list({ entity_type: 'product', entity_id: product.id, pageSize: 200 }).then((res) => res.data),
    enabled: open && Boolean(product?.id),
  });

  const { data: variantsData } = useQuery({
    queryKey: ['product-variants-for-images', product?.id],
    queryFn: () => productVariantApi.list({ product_id: product.id, pageSize: 200 }),
    enabled: open && Boolean(product?.id),
  });

  const colors = [...new Set((variantsData?.data ?? []).map((variant) => variant.color).filter(Boolean))];
  const colorOptions = colors.map((c) => ({ value: c, label: c }));

  const upload = useMutation({
    mutationFn: () =>
      documentApi.upload({
        file,
        entityType: 'product',
        entityId: product.id,
        color,
        imageRole,
        isPublic: true,
      }),
    onSuccess: () => {
      pushToast('success', 'Image uploaded');
      setFile(null);
      queryClient.invalidateQueries({ queryKey: imagesKey });
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });

  const remove = useMutation({
    mutationFn: (id) => documentApi.remove(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: imagesKey }),
  });

  const canUpload = Boolean(file && color && imageRole);

  return (
    <AppModal open={open} onClose={onClose} title={`Images — ${product?.name ?? ''}`}>
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-2 rounded-lg border border-border p-3">
          <p className="text-sm font-medium text-text">Upload an image</p>
          <AppSelect label="Color" value={color} onChange={(e) => setColor(e.target.value)} options={colorOptions} placeholder="Select color" />
          <AppSelect label="View" value={imageRole} onChange={(e) => setImageRole(e.target.value)} options={IMAGE_ROLE_OPTIONS} />
          <AppInput type="file" accept="image/*" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
          <div className="flex justify-end">
            <AppButton onClick={() => upload.mutate()} disabled={!canUpload} loading={upload.isPending}>
              Upload
            </AppButton>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <p className="text-sm font-medium text-text">Uploaded images</p>
          {images.length === 0 && <p className="text-sm text-text-muted">No images yet.</p>}
          <div className="grid grid-cols-3 gap-3">
            {images.map((image) => (
              <div key={image.id} className="flex flex-col gap-1 rounded-lg border border-border p-2">
                <p className="text-xs font-medium text-text">
                  {image.color ?? '—'} · {image.image_role ?? '—'}
                </p>
                <p className="truncate text-xs text-text-muted">{image.file_name}</p>
                <AppButton variant="danger" size="sm" onClick={() => remove.mutate(image.id)} loading={remove.isPending}>
                  Delete
                </AppButton>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AppModal>
  );
}
