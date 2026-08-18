import { useRef, useState } from 'react';
import { supabaseClient } from '../lib/supabaseClient';

/* ============================================================
   ImageUploader — reusable component for admin modals.

   Props:
     value       (string|null) — current image URL (from DB)
     onChange    (fn)          — called with new public URL after upload
     bucket      (string)      — Supabase Storage bucket name
     folder      (string)      — subfolder inside the bucket (optional)
     label       (string)      — field label text
     accept      (string)      — MIME types (default: image/*)

   Behaviour:
     - Shows a drag-and-drop / click-to-browse zone
     - If `value` is set, shows a live preview thumbnail above
     - On file select: uploads to Supabase Storage → calls onChange(publicUrl)
     - Shows upload progress + error inline
     - "Remove" button clears the value (calls onChange(null))
   ============================================================ */

const MAX_FILE_SIZE_MB = 5;

export default function ImageUploader({
  value,
  onChange,
  bucket = 'product-images',
  folder = '',
  label = 'Product Image',
  accept = 'image/*',
}) {
  const fileInputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [dragOver, setDragOver] = useState(false);

  async function uploadFile(file) {
    setError('');

    // ── Client-side validation ──────────────────────────────────
    if (!file.type.startsWith('image/')) {
      setError('Only image files are allowed.');
      return;
    }
    if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
      setError(`File must be under ${MAX_FILE_SIZE_MB} MB.`);
      return;
    }

    setUploading(true);

    try {
      // Generate a unique filename: folder/timestamp-originalname
      const ext = file.name.split('.').pop().toLowerCase();
      const safeName = file.name
        .replace(/\.[^.]+$/, '')
        .replace(/[^a-z0-9_-]/gi, '_')
        .substring(0, 60);
      const timestamp = Date.now();
      const fileName = folder
        ? `${folder}/${timestamp}-${safeName}.${ext}`
        : `${timestamp}-${safeName}.${ext}`;

      // ── Upload to Supabase Storage ──────────────────────────────
      const { error: uploadError } = await supabaseClient.storage
        .from(bucket)
        .upload(fileName, file, { upsert: false, cacheControl: '3600' });

      if (uploadError) throw uploadError;

      // ── Get the public URL ──────────────────────────────────────
      const { data } = supabaseClient.storage.from(bucket).getPublicUrl(fileName);
      if (!data?.publicUrl) throw new Error('Could not retrieve public URL.');

      onChange(data.publicUrl);
    } catch (err) {
      setError(err.message || 'Upload failed. Please try again.');
    } finally {
      setUploading(false);
      // Reset file input so the same file can be re-selected if needed
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  }

  function handleFileChange(e) {
    const file = e.target.files?.[0];
    if (file) uploadFile(file);
  }

  function handleDrop(e) {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) uploadFile(file);
  }

  function handleDragOver(e) {
    e.preventDefault();
    setDragOver(true);
  }

  function handleDragLeave() {
    setDragOver(false);
  }

  function handleRemove() {
    onChange(null);
    setError('');
  }

  return (
    <div className="img-uploader-wrap">
      <label className="field-label">{label}</label>

      {/* ── Current image preview ─────────────────────────────── */}
      {value && (
        <div className="img-uploader-preview">
          <img src={value} alt="Current" className="img-uploader-thumb" />
          <div className="img-uploader-preview-actions">
            <span className="img-uploader-preview-url" title={value}>
              {value.length > 55 ? '…' + value.slice(-50) : value}
            </span>
            <button
              type="button"
              className="img-uploader-remove-btn"
              onClick={handleRemove}
              title="Remove image"
            >
              ✕ Remove
            </button>
          </div>
        </div>
      )}

      {/* ── Drop zone ─────────────────────────────────────────── */}
      <div
        className={`img-uploader-zone${dragOver ? ' drag-over' : ''}${uploading ? ' uploading' : ''}`}
        onClick={() => !uploading && fileInputRef.current?.click()}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === 'Enter' && fileInputRef.current?.click()}
        aria-label="Upload image"
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          style={{ display: 'none' }}
          onChange={handleFileChange}
        />

        {uploading ? (
          <div className="img-uploader-spinner-wrap">
            <span className="img-uploader-spinner" />
            <span>Uploading…</span>
          </div>
        ) : (
          <>
            <svg
              className="img-uploader-icon"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
            >
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="17 8 12 3 7 8" />
              <line x1="12" y1="3" x2="12" y2="15" />
            </svg>
            <p className="img-uploader-hint">
              <strong>{value ? 'Replace image' : 'Upload image'}</strong>
              <br />
              Drag &amp; drop or <span className="img-uploader-link">browse files</span>
              <br />
              <small>PNG, JPG, WebP · Max {MAX_FILE_SIZE_MB} MB</small>
            </p>
          </>
        )}
      </div>

      {/* ── Error message ─────────────────────────────────────── */}
      {error && <p className="img-uploader-error">{error}</p>}
    </div>
  );
}
