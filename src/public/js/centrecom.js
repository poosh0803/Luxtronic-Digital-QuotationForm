// centrecom.js: Loads and parses centrecom-fetched.html, extracts product info, and displays results
document.addEventListener('DOMContentLoaded', function () {
	const searchBtn = document.getElementById('searchBtn');
	const searchInput = document.getElementById('productInput');
	const resultsDiv = document.getElementById('results');
	searchBtn.addEventListener('click', function () {
		const query = searchInput.value.trim();
		if (!query) {
			resultsDiv.innerHTML = '<p>Please enter a product name.</p>';
			return;
		}
		// Use the Centrecom API endpoint (with CORS proxy)
	const apiUrl = `https://computerparts.centrecom.com.au/api/search?cid=0ae1fd6a074947699fbe46df65ee5714&q=${encodeURIComponent(query)}`;
		resultsDiv.innerHTML = `<div style="margin-bottom:8px;font-size:0.95em;color:#555;">Fetching: <a href="${apiUrl}" target="_blank">${apiUrl}</a></div>Loading...`;
		const corsProxy = 'https://corsproxy.io/?';
		fetch(corsProxy + encodeURIComponent(apiUrl))
			.then(response => response.text())
			.then(jsonText => {
				lastFetchedHtml = jsonText;
				lastFetchedFilename = `centrecom-api-fetched-${query.replace(/[^a-z0-9]+/gi, '_')}.json`;
				let data;
				try {
					data = JSON.parse(jsonText);
				} catch (e) {
					resultsDiv.innerHTML = `<div style=\"margin-bottom:8px;font-size:0.95em;color:#555;\">Tried: <a href=\"${apiUrl}\" target=\"_blank\">${apiUrl}</a></div><p>Invalid JSON response.</p>`;
					return;
				}
				// Render products from the 'p' array in the JSON
				const products = Array.isArray(data.p) ? data.p : [];
				if (!products.length) {
					resultsDiv.innerHTML = `<div style=\"margin-bottom:8px;font-size:0.95em;color:#555;\">Fetched: <a href=\"${apiUrl}\" target=\"_blank\">${apiUrl}</a></div><p>No products found.</p><pre style=\"background:#f8f8f8; border:1px solid #ccc; padding:10px; overflow:auto; max-height:400px;\">${JSON.stringify(data, null, 2)}</pre>`;
					return;
				}
				resultsDiv.innerHTML = `<div style=\"margin-bottom:8px;font-size:0.95em;color:#555;\">Fetched: <a href=\"${apiUrl}\" target=\"_blank\">${apiUrl}</a></div>`;
				products.forEach(product => {
					const name = product.name || 'N/A';
					const price = product.price !== undefined ? `$${product.price}` : 'N/A';
					const wasPrice = product.wasPrice ? `$${product.wasPrice}` : '';
					const availability = product.stockAvailablity || product.stockAvailability || 'Unknown';
					const imgUrl = product.imgUrl || '';
					const link = product.seName ? `https://www.centrecom.com.au/${product.seName}` : (product.seoName ? `https://www.centrecom.com.au/${product.seoName}` : '#');
					const sellingPoint = product.sellingPoint || '';
					const productHTML = `
						<div class=\"product-result\" style=\"border:1px solid #ccc; margin:10px; padding:10px; display:flex; align-items:center;\">
							<img src=\"${imgUrl}\" alt=\"${name}\" style=\"width:80px; height:80px; object-fit:contain; margin-right:16px;\">
							<div>
								<a href=\"${link}\" target=\"_blank\"><strong>${name}</strong></a><br>
								<span>Price: <b>${price}</b> ${wasPrice ? `<span style='text-decoration:line-through;color:#888;font-size:0.9em;'>${wasPrice}</span>` : ''}</span><br>
								<span>Availability: <i>${availability}</i></span><br>
								<span style=\"font-size:0.95em; color:#555;\">${sellingPoint}</span>
							</div>
						</div>
					`;
					resultsDiv.innerHTML += productHTML;
				});
			})
			.catch(err => {
				resultsDiv.innerHTML = `<div style=\"margin-bottom:8px;font-size:0.95em;color:#555;\">Tried: <a href=\"${apiUrl}\" target=\"_blank\">${apiUrl}</a></div><p>Error loading products or CORS error.</p>`;
				lastFetchedHtml = '';
			});
	});
});
