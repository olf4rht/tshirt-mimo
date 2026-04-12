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
    input.value = '';
  }

  function removeStamp(id: string) {
    stamps.update((list) => list.filter((s) => s.id !== id));
  }
</script>

<div class="stamp-manager">
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
          <button class="delete-btn" onclick={() => removeStamp(stamp.id)}>x</button>
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
    gap: 10px;
  }

  .upload-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 8px 16px;
    background: rgba(255,255,255,0.85);
    color: #B0B0B0;
    border: 1px solid #CECDCC;
    border-radius: 26px;
    font-size: 12px;
    font-weight: 600;
    cursor: pointer;
    transition: background 0.15s;
    align-self: flex-start;
  }

  .upload-btn:hover {
    background: #fff;
    color: #666;
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
    background: #fff;
    border-radius: 8px;
    overflow: hidden;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 1px solid #EDEDEB;
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
    width: 16px;
    height: 16px;
    border: none;
    border-radius: 50%;
    background: #e44;
    color: white;
    font-size: 9px;
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
