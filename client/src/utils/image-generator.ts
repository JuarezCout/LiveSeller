import { toPng } from 'html-to-image';

/**
 * Generates an order summary image showing products, prices, and payment info
 * @param order The order data
 * @param items The order items with product info
 */
export async function generateOrderSummary(order: any, items: any[]) {
  // Create a temporary DOM element to render the summary
  const element = document.createElement('div');
  element.style.width = '600px';
  element.style.padding = '20px';
  element.style.backgroundColor = 'white';
  element.style.fontFamily = 'Inter, sans-serif';
  
  // Header section
  const header = document.createElement('div');
  header.style.marginBottom = '20px';
  header.style.textAlign = 'center';
  
  const logo = document.createElement('h1');
  logo.textContent = 'LiveSell';
  logo.style.color = '#4F46E5';
  logo.style.fontSize = '24px';
  logo.style.fontWeight = 'bold';
  logo.style.marginBottom = '10px';
  
  const orderTitle = document.createElement('h2');
  orderTitle.textContent = `Order Summary #${order.id}`;
  orderTitle.style.fontSize = '18px';
  orderTitle.style.marginBottom = '5px';
  
  const orderDate = document.createElement('p');
  const date = new Date(order.createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  orderDate.textContent = `Order Date: ${date}`;
  orderDate.style.fontSize = '14px';
  orderDate.style.color = '#6B7280';
  
  header.appendChild(logo);
  header.appendChild(orderTitle);
  header.appendChild(orderDate);
  
  // Products section
  const productsSection = document.createElement('div');
  productsSection.style.marginBottom = '20px';
  
  const productsTitle = document.createElement('h3');
  productsTitle.textContent = 'Reserved Items';
  productsTitle.style.fontSize = '16px';
  productsTitle.style.fontWeight = 'bold';
  productsTitle.style.marginBottom = '10px';
  productsTitle.style.paddingBottom = '5px';
  productsTitle.style.borderBottom = '1px solid #E5E7EB';
  
  productsSection.appendChild(productsTitle);
  
  // Product items
  items.forEach(item => {
    const productItem = document.createElement('div');
    productItem.style.display = 'flex';
    productItem.style.marginBottom = '15px';
    productItem.style.padding = '10px';
    productItem.style.backgroundColor = '#F9FAFB';
    productItem.style.borderRadius = '8px';
    
    // Product image
    const imageContainer = document.createElement('div');
    imageContainer.style.width = '80px';
    imageContainer.style.height = '80px';
    imageContainer.style.overflow = 'hidden';
    imageContainer.style.marginRight = '15px';
    imageContainer.style.borderRadius = '4px';
    imageContainer.style.border = '1px solid #E5E7EB';
    
    if (item.product?.imageUrl) {
      const img = document.createElement('img');
      img.src = item.product.imageUrl;
      img.style.width = '100%';
      img.style.height = '100%';
      img.style.objectFit = 'cover';
      imageContainer.appendChild(img);
    } else {
      imageContainer.style.backgroundColor = '#F3F4F6';
      imageContainer.style.display = 'flex';
      imageContainer.style.alignItems = 'center';
      imageContainer.style.justifyContent = 'center';
      imageContainer.textContent = 'No image';
      imageContainer.style.color = '#9CA3AF';
      imageContainer.style.fontSize = '12px';
    }
    
    // Product details
    const details = document.createElement('div');
    details.style.flex = '1';
    
    const name = document.createElement('p');
    name.textContent = item.product?.name || 'Unknown Product';
    name.style.fontWeight = 'bold';
    name.style.fontSize = '14px';
    name.style.marginBottom = '3px';
    
    const reference = document.createElement('p');
    reference.textContent = `Ref: ${item.product?.reference || 'N/A'}`;
    reference.style.fontSize = '12px';
    reference.style.color = '#6B7280';
    reference.style.marginBottom = '5px';
    
    const quantity = document.createElement('p');
    quantity.textContent = `Quantity: ${item.quantity}`;
    quantity.style.fontSize = '12px';
    quantity.style.color = '#6B7280';
    
    details.appendChild(name);
    details.appendChild(reference);
    details.appendChild(quantity);
    
    // Price
    const price = document.createElement('div');
    price.style.textAlign = 'right';
    price.style.minWidth = '80px';
    
    const priceText = document.createElement('p');
    priceText.textContent = `$${item.price.toFixed(2)}`;
    priceText.style.fontWeight = 'bold';
    priceText.style.fontSize = '14px';
    
    price.appendChild(priceText);
    
    productItem.appendChild(imageContainer);
    productItem.appendChild(details);
    productItem.appendChild(price);
    
    productsSection.appendChild(productItem);
  });
  
  // Price summary
  const summary = document.createElement('div');
  summary.style.marginBottom = '25px';
  summary.style.borderTop = '1px solid #E5E7EB';
  summary.style.paddingTop = '15px';
  
  const subtotal = document.createElement('div');
  subtotal.style.display = 'flex';
  subtotal.style.justifyContent = 'space-between';
  subtotal.style.marginBottom = '5px';
  
  const subtotalLabel = document.createElement('p');
  subtotalLabel.textContent = 'Subtotal';
  subtotalLabel.style.fontSize = '14px';
  subtotalLabel.style.color = '#6B7280';
  
  const subtotalValue = document.createElement('p');
  subtotalValue.textContent = `$${(order.totalAmount - order.shippingFee).toFixed(2)}`;
  subtotalValue.style.fontSize = '14px';
  
  subtotal.appendChild(subtotalLabel);
  subtotal.appendChild(subtotalValue);
  
  const shipping = document.createElement('div');
  shipping.style.display = 'flex';
  shipping.style.justifyContent = 'space-between';
  shipping.style.marginBottom = '10px';
  
  const shippingLabel = document.createElement('p');
  shippingLabel.textContent = 'Shipping';
  shippingLabel.style.fontSize = '14px';
  shippingLabel.style.color = '#6B7280';
  
  const shippingValue = document.createElement('p');
  shippingValue.textContent = `$${order.shippingFee.toFixed(2)}`;
  shippingValue.style.fontSize = '14px';
  
  shipping.appendChild(shippingLabel);
  shipping.appendChild(shippingValue);
  
  const total = document.createElement('div');
  total.style.display = 'flex';
  total.style.justifyContent = 'space-between';
  total.style.fontWeight = 'bold';
  total.style.marginTop = '5px';
  total.style.paddingTop = '5px';
  total.style.borderTop = '1px dashed #E5E7EB';
  
  const totalLabel = document.createElement('p');
  totalLabel.textContent = 'Total';
  totalLabel.style.fontSize = '16px';
  
  const totalValue = document.createElement('p');
  totalValue.textContent = `$${order.totalAmount.toFixed(2)}`;
  totalValue.style.fontSize = '16px';
  
  total.appendChild(totalLabel);
  total.appendChild(totalValue);
  
  summary.appendChild(subtotal);
  summary.appendChild(shipping);
  summary.appendChild(total);
  
  // Payment instructions
  const paymentInfo = document.createElement('div');
  paymentInfo.style.backgroundColor = '#F3F4F6';
  paymentInfo.style.padding = '15px';
  paymentInfo.style.borderRadius = '8px';
  
  const paymentTitle = document.createElement('h3');
  paymentTitle.textContent = 'Payment Instructions';
  paymentTitle.style.fontSize = '16px';
  paymentTitle.style.fontWeight = 'bold';
  paymentTitle.style.marginBottom = '10px';
  
  const accountInfo = document.createElement('p');
  accountInfo.innerHTML = '<span style="font-weight: 500;">Bank Transfer</span><br>Account: 1234-5678-9012-3456<br>Name: LiveSell Shop';
  accountInfo.style.fontSize = '14px';
  accountInfo.style.marginBottom = '10px';
  
  const instructions = document.createElement('p');
  instructions.textContent = 'Please include your order number in the payment reference. Send proof of payment through the client portal.';
  instructions.style.fontSize = '14px';
  instructions.style.color = '#6B7280';
  
  paymentInfo.appendChild(paymentTitle);
  paymentInfo.appendChild(accountInfo);
  paymentInfo.appendChild(instructions);
  
  // Footer
  const footer = document.createElement('div');
  footer.style.marginTop = '25px';
  footer.style.textAlign = 'center';
  footer.style.fontSize = '12px';
  footer.style.color = '#9CA3AF';
  
  const footerText = document.createElement('p');
  footerText.textContent = 'Thank you for your order!';
  
  footer.appendChild(footerText);
  
  // Assemble the complete summary
  element.appendChild(header);
  element.appendChild(productsSection);
  element.appendChild(summary);
  element.appendChild(paymentInfo);
  element.appendChild(footer);
  
  // Temporarily add to document to render (required for html-to-image)
  document.body.appendChild(element);
  
  try {
    // Convert to PNG
    const dataUrl = await toPng(element);
    
    // Create a link to download the image
    const link = document.createElement('a');
    link.download = `order-summary-${order.id}.png`;
    link.href = dataUrl;
    link.click();
    
    return dataUrl;
  } catch (error) {
    console.error('Error generating order summary:', error);
    throw error;
  } finally {
    // Clean up the temporary element
    document.body.removeChild(element);
  }
}
