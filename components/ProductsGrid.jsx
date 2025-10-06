// components/ProductsGrid.jsx
import React, { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import ProductCard from './ProductCard'

const ProductsGrid = () => {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let isMounted = true

    const fetchProducts = async () => {
      setLoading(true)
      setError(null)

      // Adjust the columns you need; here we select all columns
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false }) // optional: order by created_at

      if (!isMounted) return

      if (error) {
        setError(error.message || 'Failed to load products')
        setProducts([])
      } else {
        // If images are stored as JSON text in `image` column, try to parse safely
        const normalized = (data || []).map((p) => {
          let image = p.image
          // If image is a JSON string, parse it
          try {
            if (typeof image === 'string' && (image.startsWith('[') || image.startsWith('{'))) {
              image = JSON.parse(image)
            }
          } catch (e) {
            // leave image as-is if JSON.parse fails
          }

          return { ...p, image }
        })

        setProducts(normalized)
      }

      setLoading(false)
    }

    fetchProducts()

    // optional: realtime subscription (commented out). If you want realtime updates, enable and configure:
    // const subscription = supabase
    //   .from('products')
    //   .on('*', payload => { fetchProducts() })
    //   .subscribe()
    //
    // return () => {
    //   isMounted = false
    //   supabase.removeSubscription(subscription)
    // }

    return () => {
      isMounted = false
    }
  }, [])

  if (loading) {
    return <div className="py-8 text-center">Loading products...</div>
  }

  if (error) {
    return <div className="py-8 text-center text-red-500">Error: {error}</div>
  }

  if (!products.length) {
    return <div className="py-8 text-center">No products found.</div>
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
      {products.map((product) => (
        <ProductCard key={product._id || product.id} product={product} />
      ))}
    </div>
  )
}

export default ProductsGrid
