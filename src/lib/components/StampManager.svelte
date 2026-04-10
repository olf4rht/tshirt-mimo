<script lang="ts">
  import { stamps } from '$lib/stores/designer';

  function onFileChange(e: Event) {
    const input = e.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const src = reader.result as string;
      stamps.update((list) => [
        ...list,
        {
          id: Date.now().toString(),
          src,
          x: 50,
          y: 50,
          scale: 1,
        },
      ]);
    };
    reader.readAsDataURL(file);
    // Reset so the same file can be re-uploaded
    input.value = '';
  }

  function removeStamp(id: string) {
    stamps.update((list) => list.filter((s) => s.id !== id));
  }
</script>

<div class="stamp-manager">
  <span class="section-label">Stamps</span>

  <label class="upload-btn">
    Upload Stamp
    <input
      type="file"
      accept=".svg,.png,image/svg+xml,image/png"
      onchange={onFileChange}
      hidden
    />
  </label>

  {#if $stamps.length > 0}
    <div class="stamp-list">
      {#each $stamps as stamp (stamp.id)}
        <div class="stamp-item">
          <img src={stamp.src} alt="stamp" class="stamp-thumb" />
          <button class="delete-btn" onclick={() => removeStamp(stamp.id)}>✕</button>
        </div>
      {/each}
    </div>
  {/if}
</div>

<style>
  .stamp-manager {
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .section-label {
    font-size: 11px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 1px;
    color: #888;
  }

  .upload-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 8px 16px;
    background: #3a3a3a;
    color: #ccc;
    border: 1px solid #555;
    border-radius: 8px;
    font-size: 13px;
    cursor: pointer;
    transition: background 0.15s;
  }

  .upload-btn:hover {
    background: #4a4a4a;
    color: #fff;
  }

  .stamp-list {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }

  .stamp-item {
    position: relative;
    width: 48px;
    height: 48px;
    background: #333;
    border-radius: 6px;
    overflow: hidden;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .stamp-thumb {
    max-width: 100%;
    max-height: 100%;
    object-fit: contain;
  }

  .delete-btn {
    position: absolute;
    top: -2px;
    right: -2px;
    width: 18px;
    height: 18px;
    border: none;
    border-radius: 50%;
    background: #e44;
    color: white;
    font-size: 10px;
    line-height: 1;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0;
  }

  .delete-btn:hover {
    background: #f55;
  }
</style>
