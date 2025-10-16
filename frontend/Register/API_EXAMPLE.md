# Backend API Structure for Projects

## Endpoint
```
GET http://localhost:5000/api/projects
```

## Expected Response Format (JSON)

```json
[
  {
    "id": 1,
    "title": "Fund Ocean Alkalinity Enhancement in Italy",
    "description": "Limenet is an Italian climate tech startup pioneering carbon removal through a patented Ocean Alkalinity Enhancement (OAE) platform. By mimicking natural processes, Limenet permanently stores CO₂ in seawater as calcium bicarbonates.",
    "image": "https://example.com/ocean-project.jpg",
    "pricePerTonne": 680.00,
    "tonnesAvailable": 15
  },
  {
    "id": 2,
    "title": "Support Organic Waste Composting in the USA",
    "description": "The Black Earth Organic Waste Compost project in Massachusetts, USA, is an organic waste composting initiative operational since December 1, 2021, diverting food waste from landfills to reduce 7,000 tCO2e annually.",
    "image": "https://example.com/composting-project.jpg",
    "pricePerTonne": 19.50,
    "tonnesAvailable": 5800
  },
  {
    "id": 3,
    "title": "Drive Paraguay's Reforestation",
    "description": "The Forestal Río Aquidabán project is restoring 301 hectares of degraded grasslands in Concepción, northeastern Paraguay, through a silvopastoral agroforestry system that integrates reforestation with sustainable cattle ranching.",
    "image": "https://example.com/paraguay-forest.jpg",
    "pricePerTonne": 20.23,
    "tonnesAvailable": 1500
  },
  {
    "id": 4,
    "title": "Sequester Carbon in Argentina",
    "description": "The Urunday Afforestation Project in Corrientes, Argentina, has restored 3,143 hectares of degraded grasslands into FSC-certified eucalyptus forests, set to remove over 1 million tonnes of CO2e.",
    "image": "https://example.com/argentina-forest.jpg",
    "pricePerTonne": 11.05,
    "tonnesAvailable": 1000
  }
]
```

## Database Schema Example (for backend)

```sql
CREATE TABLE projects (
  id INT PRIMARY KEY AUTO_INCREMENT,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  image VARCHAR(500) NOT NULL,
  pricePerTonne DECIMAL(10, 2) NOT NULL,
  tonnesAvailable INT NOT NULL,
  location VARCHAR(255),
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

## How to Use

1. **Update the API endpoint** in `ProjectsSection.jsx` line 17:
   ```javascript
   const response = await fetch('YOUR_API_URL_HERE/api/projects');
   ```

2. **Make sure your backend returns JSON** in the format shown above

3. **Required fields** for each project:
   - `id` (number) - Unique identifier
   - `title` (string) - Project title
   - `description` (string) - Project description
   - `image` (string) - URL to project image
   - `pricePerTonne` (number) - Price per tonne
   - `tonnesAvailable` (number) - Available tonnes

4. **Optional fields** you can add:
   - `location` (string)
   - `projectType` (string)
   - `status` (string)
   - `verifiedBy` (string)
   - `startDate` (date)
   - `endDate` (date)
