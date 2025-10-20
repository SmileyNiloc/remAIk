import { useDatabaseList } from "vuefire";
import { set } from "firebase/database";
import { reactive, ref, watch } from "vue";
import { debounce } from "lodash";
import { log } from "./logger";

/**
 * EditableDatabaseList - A reactive wrapper for Firebase Realtime Database lists
 *
 * This class provides a two-way sync between a Firebase Realtime Database reference
 * and a local reactive Vue data structure. It handles real-time updates from Firebase
 * and provides methods to add, remove, and update items with automatic debouncing.
 *
 * @class EditableDatabaseList
 * @example
 * const todoList = new EditableDatabaseList(
 *   ref(database, 'todos'),
 *   (item) => ({ ...item, completed: false }),
 *   1000
 * );
 */
export class EditableDatabaseList {
  /**
   * Creates an instance of EditableDatabaseList
   *
   * @param {DatabaseReference} databaseRef - Firebase database reference to sync with
   * @param {Function|null} itemFactory - Optional factory function to transform items
   *                                       when they're loaded from Firebase. Useful for
   *                                       adding default properties or computed values.
   * @param {number} debounceMs - Milliseconds to debounce updates (default: 500ms)
   */
  constructor(databaseRef, itemFactory = null, debounceMs = 500) {
    log("[EditableDatabaseList] Constructor called", {
      databaseRef: databaseRef?.toString(),
      hasItemFactory: !!itemFactory,
      debounceMs,
    });

    // Store the Firebase database reference
    this.databaseRef = databaseRef;

    // Set up VueFire's reactive database list binding
    this.firebaseData = useDatabaseList(databaseRef);

    watch(
      this.firebaseData,
      (val) => {
        if (val && val.length) {
          log("[EditableDatabaseList] Initial Firebase data:", val);
        } else {
          log("[EditableDatabaseList] No initial Firebase data");
        }
      },
      { immediate: true, once: true } // 👈 runs immediately and only once
    );

    // Create a reactive array to hold our local data items
    this.items = reactive([]);

    // Track whether we're currently saving to prevent sync conflicts
    this.isSaving = ref(false);

    // Store debounce timing for update operations
    this.debounceMs = debounceMs;

    // Store the item factory function for transforming data
    this.itemFactory = itemFactory;

    // Create debounced save function for auto-syncing local changes
    this._debouncedSave = debounce(
      (itemId, data) => this._saveToFirebase(itemId, data),
      this.debounceMs
    );

    // Initialize the two-way sync between Firebase and local data
    this._setupSync();
  }

  /**
   * Sets up the two-way synchronization between Firebase and local reactive data
   *
   * This method watches for changes in the Firebase data and updates the local
   * reactive items array accordingly. It skips updates when we're actively saving
   * to prevent conflicts between local changes and Firebase updates.
   *
   * Also sets up watchers on local items to auto-save changes to Firebase with debouncing.
   *
   * @private
   */
  _setupSync() {
    // Watch Firebase data and sync to local items
    watch(
      this.firebaseData,
      (newItems) => {
        log("[EditableDatabaseList] Firebase data changed", {
          newItemsCount: newItems?.length || 0,
          isSaving: this.isSaving.value,
        });

        // Only sync from Firebase to local if we're not currently saving
        // This prevents our local changes from being overwritten
        if (newItems && !this.isSaving.value) {
          log("[EditableDatabaseList] Syncing Firebase data to local items");
          // Clear the current items array
          this.items.splice(0, this.items.length);
          // this.items.length = 0;
          // Populate with new items from Firebase
          newItems.forEach((item, index) => {
            log(`[EditableDatabaseList] Processing item ${index}:`, item.id);
            if (this.itemFactory) {
              // Use custom factory function if provided
              this.items.push(this.itemFactory(item));
            } else {
              // Otherwise, just create a reactive copy of the item
              this.items.push(reactive({ ...item }));
            }
          });

          log(
            `[EditableDatabaseList] Synced ${this.items.length} items to local array`
          );

          // Set up watchers for each item to auto-sync local changes
          this._setupItemWatchers();
        } else if (this.isSaving.value) {
          log("[EditableDatabaseList] Skipping sync - currently saving");
        }
      },
      { immediate: true, deep: true } // Run immediately and watch nested properties
    );
  }

  /**
   * Sets up watchers on each item to automatically sync local changes to Firebase
   *
   * When any property of an item changes, the debounced save function is called
   * to update Firebase after the specified delay.
   *
   * @private
   */
  _setupItemWatchers() {
    log(
      `[EditableDatabaseList] Setting up watchers for ${this.items.length} items`
    );
    this.items.forEach((item) => {
      // Watch each item deeply for any changes
      log(`Watching item:`, item);
      watch(
        () => item,
        (newValue) => {
          log(`[EditableDatabaseList] Item ${item.id} changed`, {
            isSaving: this.isSaving.value,
            hasId: !!item.id,
          });
          // Only trigger save if we're not currently syncing from Firebase
          if (!this.isSaving.value && item.id) {
            log("Changed Value:", newValue);
            log("Updating database with data: ", this.items);
            // Call debounced save function, overwriting full database
            this._debouncedSave(this.items);
          } else {
            log(
              `[EditableDatabaseList] Skipping save for item ${
                item.id
              } (isSaving: ${this.isSaving.value}, hasId: ${!!item.id})`
            );
          }
        },
        { deep: true } // Watch all nested properties
      );
    });
  }

  /**
   * Internal method to save data to Firebase (called by debounced function)
   *
   * @param {Object} data - The data to save
   * @private
   */
  async _saveToFirebase(data) {
    log(`[EditableDatabaseList] Starting save to Firebase`, {
      data,
    });
    this.isSaving.value = true;
    try {
      //Update the entire database
      await set(this.databaseRef, data);
      log(`[EditableDatabaseList] ✅ Auto-saved Firebase successfully`);
    } catch (error) {
      console.error(
        `[EditableDatabaseList] ❌ Auto-save failed for database: `,
        error
      );
    } finally {
      this.isSaving.value = false;
      log(`[EditableDatabaseList] Save completed, isSaving set to false`);
    }
  }
}
