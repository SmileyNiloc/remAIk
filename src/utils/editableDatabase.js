import { useDatabaseList } from "vuefire";
import { update, push, remove, child } from "firebase/database";
import { reactive, ref, watch } from "vue";
import { debounce } from "lodash";

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
    // Store the Firebase database reference
    this.databaseRef = databaseRef;

    // Set up VueFire's reactive database list binding
    this.firebaseData = useDatabaseList(databaseRef);

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
        // Only sync from Firebase to local if we're not currently saving
        // This prevents our local changes from being overwritten
        if (newItems && !this.isSaving.value) {
          // Clear the current items array
          this.items.splice(0, this.items.length);

          // Populate with new items from Firebase
          newItems.forEach((item) => {
            if (this.itemFactory) {
              // Use custom factory function if provided
              this.items.push(this.itemFactory(item));
            } else {
              // Otherwise, just create a reactive copy of the item
              this.items.push(reactive({ ...item }));
            }
          });

          // Set up watchers for each item to auto-sync local changes
          this._setupItemWatchers();
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
    this.items.forEach((item) => {
      // Watch each item deeply for any changes
      watch(
        () => item,
        (newValue) => {
          // Only trigger save if we're not currently syncing from Firebase
          if (!this.isSaving.value && item.id) {
            // Extract the Firebase ID and clean data for saving
            const { id, ...data } = newValue;

            // Call debounced save function
            this._debouncedSave(id, data);
          }
        },
        { deep: true } // Watch all nested properties
      );
    });
  }

  /**
   * Internal method to save data to Firebase (called by debounced function)
   *
   * @param {string} itemId - The ID of the item to save
   * @param {Object} data - The data to save
   * @private
   */
  async _saveToFirebase(itemId, data) {
    this.isSaving.value = true;
    try {
      const itemRef = child(this.databaseRef, itemId);
      await update(itemRef, data);
      console.log(`Auto-saved item ${itemId} to Firebase`);
    } catch (error) {
      console.error("Auto-save failed:", error);
    } finally {
      this.isSaving.value = false;
    }
  }

  /**
   * Adds a new item to the Firebase database
   *
   * @param {Object} data - The data object to add to the database
   * @returns {Promise<void>}
   * @throws {Error} If the database operation fails
   *
   * @example
   * await todoList.addItem({ title: 'Buy groceries', completed: false });
   */
  async addItem(data) {
    // Set saving flag to prevent sync conflicts
    this.isSaving.value = true;
    try {
      // Push the new item to Firebase
      await push(this.databaseRef, data);
    } catch (error) {
      console.error("Add item failed:", error);
      // Re-throw to allow caller to handle the error
      throw error;
    } finally {
      // Always clear the saving flag
      this.isSaving.value = false;
    }
  }

  /**
   * Removes an item from the Firebase database
   *
   * @param {string} itemId - The unique ID of the item to remove
   * @returns {Promise<void>}
   * @throws {Error} If the database operation fails
   *
   * @example
   * await todoList.removeItem('item-123');
   */
  async removeItem(itemId) {
    // Set saving flag to prevent sync conflicts
    this.isSaving.value = true;
    try {
      // Create a reference to the specific item
      const itemRef = child(this.databaseRef, itemId);
      // Remove the item from Firebase
      await remove(itemRef);
    } catch (error) {
      console.error("Remove item failed:", error);
      // Re-throw to allow caller to handle the error
      throw error;
    } finally {
      // Always clear the saving flag
      this.isSaving.value = false;
    }
  }

  /**
   * Updates an existing item in the Firebase database
   *
   * This method performs a partial update - only the properties in the
   * data object will be updated, other properties remain unchanged.
   *
   * @param {string} itemId - The unique ID of the item to update
   * @param {Object} data - The properties to update (partial update)
   * @returns {Promise<void>}
   * @throws {Error} If the database operation fails
   *
   * @example
   * await todoList.updateItem('item-123', { completed: true });
   */
  async updateItem(itemId, data) {
    // Set saving flag to prevent sync conflicts
    this.isSaving.value = true;
    try {
      // Create a reference to the specific item
      const itemRef = child(this.databaseRef, itemId);
      // Update the item in Firebase (partial update)
      await update(itemRef, data);
    } catch (error) {
      console.error("Update item failed:", error);
      // Re-throw to allow caller to handle the error
      throw error;
    } finally {
      // Always clear the saving flag
      this.isSaving.value = false;
    }
  }
}
