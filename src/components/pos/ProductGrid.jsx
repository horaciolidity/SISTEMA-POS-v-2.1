import React from "react";
import { motion } from "framer-motion";
import { Plus, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { usePOS } from "@/contexts/POSContext";

const ProductGrid = ({ products = [] }) => {
  const { addToCart } = usePOS();

  if (!products.length) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-gray-500">
        <Package className="h-16 w-16 mb-4" />
        <p className="text-lg font-medium">No se encontraron productos</p>
        <p className="text-sm">Intenta con otro término de búsqueda</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
      {products.map((product, index) => (
        <motion.div
          key={product.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.05 }}
        >
          <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer group border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
            <CardContent className="p-4">
              {/* Imagen del producto */}
              <div className="aspect-square mb-3 overflow-hidden rounded-lg bg-gray-100">
                <img
                  alt={`Imagen de ${product.name}`}
                  src={
                    product.image_url ||
                    "https://images.unsplash.com/photo-1574705493383-9ac8b2c5f42f?w=400&q=80"
                  }
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                />
              </div>

              {/* Info del producto */}
              <div className="space-y-2">
                <h3 className="font-medium text-sm line-clamp-2 min-h-[2.5rem]">
                  {product.name}
                </h3>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-lg font-bold text-green-600">
                      ${product.price?.toFixed(2) || "0.00"}
                    </p>
                    <p className="text-xs text-gray-500">
                      Stock: {product.stock ?? 0}
                    </p>
                  </div>

                  <Button
                    size="sm"
                    onClick={() => addToCart(product)}
                    disabled={product.stock <= 0}
                    className="shrink-0"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>

                {product.stock <= product.min_stock && (
                  <div className="text-xs text-orange-600 font-medium">
                    Stock bajo
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
};

export default ProductGrid;
