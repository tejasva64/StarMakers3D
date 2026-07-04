import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus } from 'lucide-react';
import { Button } from './ui/button';
import { trpc } from '@/lib/trpc';
import { toast } from 'sonner';

interface ColorPart {
  id?: number;
  partName: string;
  colors: string[];
}

interface Product {
  id: number;
  name: string;
  description: string | null;
  price: string;
  category: string;
  imageUrl: string | null;
  stock: number;
  colorParts?: ColorPart[];
}

interface ProductFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingProduct: Product | null;
  onSuccess: () => void;
}

export default function ProductFormModal({
  isOpen,
  onClose,
  editingProduct,
  onSuccess,
}: ProductFormModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: 'Electronics',
    imageUrl: '',
    stock: 0,
  });
  const [colorParts, setColorParts] = useState<ColorPart[]>([]);
  const [newPartName, setNewPartName] = useState('');
  const [newColor, setNewColor] = useState('');
  const [selectedPartIndex, setSelectedPartIndex] = useState<number | null>(null);

  const createProductMutation = trpc.products.create.useMutation();
  const updateProductMutation = trpc.products.update.useMutation();

  useEffect(() => {
    if (editingProduct) {
      setFormData({
        name: editingProduct.name,
        description: editingProduct.description || '',
        price: editingProduct.price,
        category: editingProduct.category,
        imageUrl: editingProduct.imageUrl || '',
        stock: editingProduct.stock,
      });
      setColorParts(editingProduct.colorParts || []);
    } else {
      setFormData({
        name: '',
        description: '',
        price: '',
        category: 'Electronics',
        imageUrl: '',
        stock: 0,
      });
      setColorParts([]);
    }
  }, [editingProduct, isOpen]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'stock' ? parseInt(value) : value,
    }));
  };

  const handleAddColorPart = () => {
    if (!newPartName.trim()) {
      toast.error('Part name is required');
      return;
    }
    setColorParts([...colorParts, { partName: newPartName, colors: [] }]);
    setNewPartName('');
  };

  const handleAddColorTopart = (partIndex: number) => {
    if (!newColor.trim()) {
      toast.error('Color is required');
      return;
    }
    const updatedParts = [...colorParts];
    updatedParts[partIndex].colors.push(newColor);
    setColorParts(updatedParts);
    setNewColor('');
  };

  const handleRemoveColor = (partIndex: number, colorIndex: number) => {
    const updatedParts = [...colorParts];
    updatedParts[partIndex].colors.splice(colorIndex, 1);
    setColorParts(updatedParts);
  };

  const handleRemoveColorPart = (partIndex: number) => {
    setColorParts(colorParts.filter((_, i) => i !== partIndex));
    setSelectedPartIndex(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const productData = {
        ...formData,
        colorParts: JSON.stringify(colorParts),
      };

      if (editingProduct) {
        await updateProductMutation.mutateAsync({
          id: editingProduct.id,
          ...productData,
        });
      } else {
        await createProductMutation.mutateAsync(productData);
      }

      onSuccess();
      onClose();
    } catch (error) {
      console.error('Failed to save product:', error);
      toast.error('Failed to save product');
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.3 }}
          >
            <div className="glass-card w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-white/10 sticky top-0 bg-background/50 backdrop-blur">
                <h2 className="text-2xl font-bold">
                  {editingProduct ? 'Edit Product' : 'Add New Product'}
                </h2>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-white/10 rounded transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold mb-2">Product Name</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-foreground placeholder-foreground/40 focus:outline-none focus:border-cyan-400/50 transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-2">Category</label>
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-foreground focus:outline-none focus:border-cyan-400/50 transition-colors"
                    >
                      <option value="Electronics">Electronics</option>
                      <option value="Accessories">Accessories</option>
                      <option value="Wearables">Wearables</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">Description</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-foreground placeholder-foreground/40 focus:outline-none focus:border-cyan-400/50 transition-colors resize-none"
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-semibold mb-2">Price</label>
                    <input
                      type="number"
                      name="price"
                      value={formData.price}
                      onChange={handleInputChange}
                      step="0.01"
                      required
                      className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-foreground placeholder-foreground/40 focus:outline-none focus:border-cyan-400/50 transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-2">Stock</label>
                    <input
                      type="number"
                      name="stock"
                      value={formData.stock}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-foreground placeholder-foreground/40 focus:outline-none focus:border-cyan-400/50 transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-2">Image URL</label>
                    <input
                      type="url"
                      name="imageUrl"
                      value={formData.imageUrl}
                      onChange={handleInputChange}
                      placeholder="https://..."
                      className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-foreground placeholder-foreground/40 focus:outline-none focus:border-cyan-400/50 transition-colors"
                    />
                  </div>
                </div>

                {/* Color Parts */}
                <div className="border-t border-white/10 pt-4 mt-4">
                  <h3 className="text-sm font-semibold mb-3">Color Parts</h3>
                  <p className="text-xs text-foreground/60 mb-3">Define color options for different parts (e.g., Body, Text, Accents)</p>
                  <div className="space-y-3">
                    {/* Add new color part */}
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newPartName}
                        onChange={(e) => setNewPartName(e.target.value)}
                        placeholder="e.g., Body, Text, Accents"
                        className="flex-1 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-foreground placeholder-foreground/40 focus:outline-none focus:border-cyan-400/50 transition-colors text-sm"
                      />
                      <Button
                        type="button"
                        onClick={handleAddColorPart}
                        className="bg-cyan-400 hover:bg-cyan-500 text-background px-3"
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>

                    {/* Color parts list */}
                    <AnimatePresence>
                      {colorParts.map((part, partIndex) => (
                        <motion.div
                          key={partIndex}
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="border border-white/10 rounded p-3 space-y-2 text-sm"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-medium">{part.partName}</span>
                            <button
                              type="button"
                              onClick={() => handleRemoveColorPart(partIndex)}
                              className="p-1 hover:bg-red-400/20 rounded transition-colors"
                            >
                              <X className="w-3 h-3 text-red-400" />
                            </button>
                          </div>

                          {/* Colors for this part */}
                          <div className="flex flex-wrap gap-1">
                            {part.colors.map((color, colorIndex) => (
                              <motion.div
                                key={colorIndex}
                                initial={{ scale: 0.8 }}
                                animate={{ scale: 1 }}
                                className="flex items-center gap-1 px-2 py-1 bg-white/10 rounded text-xs"
                              >
                                <div
                                  className="w-3 h-3 rounded-full border border-white/30"
                                  style={{ backgroundColor: color }}
                                />
                                <span>{color}</span>
                                <button
                                  type="button"
                                  onClick={() => handleRemoveColor(partIndex, colorIndex)}
                                  className="ml-1 hover:text-red-400"
                                >
                                  <X className="w-2 h-2" />
                                </button>
                              </motion.div>
                            ))}
                          </div>

                          {/* Add color to this part */}
                          {selectedPartIndex === partIndex && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              exit={{ opacity: 0, height: 0 }}
                              className="flex gap-2 pt-2"
                            >
                              <input
                                type="color"
                                value={newColor}
                                onChange={(e) => setNewColor(e.target.value)}
                                className="w-10 h-8 p-1 cursor-pointer rounded"
                              />
                              <input
                                type="text"
                                value={newColor}
                                onChange={(e) => setNewColor(e.target.value)}
                                placeholder="#000000"
                                className="flex-1 px-2 py-1 bg-white/5 border border-white/10 rounded text-xs"
                              />
                              <Button
                                type="button"
                                onClick={() => handleAddColorTopart(partIndex)}
                                className="bg-purple-400 hover:bg-purple-500 text-background px-2 h-8 text-xs"
                              >
                                Add
                              </Button>
                            </motion.div>
                          )}

                          {selectedPartIndex !== partIndex && (
                            <Button
                              type="button"
                              onClick={() => setSelectedPartIndex(partIndex)}
                              variant="outline"
                              className="w-full text-xs h-7"
                            >
                              <Plus className="w-3 h-3 mr-1" />
                              Add Color
                            </Button>
                          )}
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-4 pt-4 border-t border-white/10 mt-4">
                  <Button
                    type="submit"
                    disabled={createProductMutation.isPending || updateProductMutation.isPending}
                    className="flex-1 magnetic-button bg-cyan-400 hover:bg-cyan-500 text-background font-semibold"
                  >
                    {editingProduct ? 'Update Product' : 'Create Product'}
                  </Button>
                  <Button
                    type="button"
                    onClick={onClose}
                    variant="outline"
                    className="flex-1 border-purple-400/50 text-purple-400 hover:bg-purple-400/10"
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
