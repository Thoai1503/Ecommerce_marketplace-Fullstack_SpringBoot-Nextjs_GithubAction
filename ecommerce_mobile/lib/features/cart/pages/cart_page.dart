import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../providers/cart_provider.dart';

class CartPage extends ConsumerWidget {
  const CartPage({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final cartState = ref.watch(cartProvider);

    return Scaffold(
      appBar: AppBar(title: const Text('Cart')),
      body: cartState.when(
        loading: () => const Center(child: CircularProgressIndicator()),

        error: (e, _) => Center(child: Text(e.toString())),

        data: (cart) {
          return Column(
            children: [
              Expanded(
                child: ListView.builder(
                  itemCount: cart.items.length,
                  itemBuilder: (context, index) {
                    final item = cart.items[index];

                    return ListTile(
                      leading: item.image.isNotEmpty
                          ? Image.network(
                              item.image,
                              width: 60,
                              errorBuilder: (_, __, ___) =>
                                  const Icon(Icons.image),
                            )
                          : const Icon(Icons.image),

                      title: Text(item.productName),

                      subtitle: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(item.variantName),
                          Text('\$${item.price}'),
                        ],
                      ),

                      trailing: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          IconButton(
                            onPressed: () {
                              if (item.quantity > 1) {
                                ref
                                    .read(cartProvider.notifier)
                                    .updateQuantity(
                                      item.productId,
                                      item.quantity - 1,
                                    );
                              }
                            },
                            icon: const Icon(Icons.remove),
                          ),

                          Text('${item.quantity}'),

                          IconButton(
                            onPressed: () {
                              if (item.quantity > 1) {
                                ref
                                    .read(cartProvider.notifier)
                                    .updateQuantity(
                                      item.productId,
                                      item.quantity - 1,
                                    );
                              }
                            },
                            icon: const Icon(Icons.add),
                          ),

                          IconButton(
                            onPressed: () {
                              ref
                                  .read(cartProvider.notifier)
                                  .removeItem(item.productId);
                            },
                            icon: const Icon(Icons.delete),
                          ),
                        ],
                      ),
                    );
                  },
                ),
              ),

              Container(
                padding: const EdgeInsets.all(16),

                child: Column(
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        const Text('Subtotal'),
                        Text('\$${cart.subtotal}'),
                      ],
                    ),

                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        const Text('Discount'),
                        Text('- \$${cart.discount}'),
                      ],
                    ),

                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        const Text(
                          'Total',
                          style: TextStyle(fontWeight: FontWeight.bold),
                        ),
                        Text(
                          '\$${cart.total}',
                          style: const TextStyle(fontWeight: FontWeight.bold),
                        ),
                      ],
                    ),

                    const SizedBox(height: 16),

                    ElevatedButton(
                      onPressed: () {},
                      child: const Text('Checkout'),
                    ),
                  ],
                ),
              ),
            ],
          );
        },
      ),
    );
  }
}
