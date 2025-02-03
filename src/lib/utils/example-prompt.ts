export const EXAMPLE_PROMPT = `DATA: \n"John is 25 years old and studies computer science at university"\n\n-----------\nExpected JSON format: 
{
  name: { type: "string" },
  age: { type: "number" },
  isStudent: { type: "boolean" },
  courses: {
    type: "array",
    items: { type: "string" },
  },
}`;

export const EXAMPLE_ANSWER = `{
  name: "John",
  age: 25,
  isStudent: true,
  courses: ["computer science"],
}`;

export const COMPLEX_EXAMPLE_PROMPT = `DATA:
"TechCorp Inc. has 3 offices: New York (HQ, 150 employees), London (50 employees), and Tokyo (75 employees). The company specializes in AI and Cloud Computing, with quarterly revenue of $5.2M. Current CEO is Sarah Johnson, who took over in 2020."

-----------
Expected JSON format:
{
  companyName: { type: "string" },
  offices: {
    type: "array",
    items: {
      type: "object",
      properties: {
        location: { type: "string" },
        isHeadquarters: { type: "boolean" },
        employeeCount: { type: "number" }
      }
    }
  },
  specializations: {
    type: "array",
    items: { type: "string" }
  },
  financials: {
    type: "object",
    properties: {
      quarterlyRevenue: { type: "number" },
      currency: { type: "string" }
    }
  },
  leadership: {
    type: "object",
    properties: {
      ceo: { type: "string" },
      yearStarted: { type: "number" }
    }
  }
}`;

export const COMPLEX_EXAMPLE_ANSWER = `{
  companyName: "TechCorp Inc.",
  offices: [
    {
      location: "New York",
      isHeadquarters: true,
      employeeCount: 150
    },
    {
      location: "London",
      isHeadquarters: false,
      employeeCount: 50
    },
    {
      location: "Tokyo",
      isHeadquarters: false,
      employeeCount: 75
    }
  ],
  specializations: ["AI", "Cloud Computing"],
  financials: {
    quarterlyRevenue: 5.2,
    currency: "USD"
  },
  leadership: {
    ceo: "Sarah Johnson",
    yearStarted: 2020
  }
}`;

export const NESTED_EXAMPLE_PROMPT = `DATA:
"Product catalog: iPhone 13 Pro (SKU: IP13P-128, $999, available in Silver and Gold, 128GB storage, 4.8/5 rating from 2500 reviews). Latest iOS version 15.5, released May 2022. Includes charging adapter and warranty valid until 2024."

-----------
Expected JSON format:
{
  product: {
    type: "object",
    properties: {
      name: { type: "string" },
      sku: { type: "string" },
      price: { type: "number" },
      specifications: {
        type: "object",
        properties: {
          storage: { type: "string" },
          colors: { type: "array", items: { type: "string" } },
          os: {
            type: "object",
            properties: {
              version: { type: "string" },
              releaseDate: { type: "string" }
            }
          }
        }
      },
      reviews: {
        type: "object",
        properties: {
          average: { type: "number" },
          count: { type: "number" }
        }
      },
      inclusions: { type: "array", items: { type: "string" } },
      warranty: {
        type: "object",
        properties: {
          validUntil: { type: "number" }
        }
      }
    }
  }
}`;

export const NESTED_EXAMPLE_ANSWER = `{
  product: {
    name: "iPhone 13 Pro",
    sku: "IP13P-128",
    price: 999,
    specifications: {
      storage: "128GB",
      colors: ["Silver", "Gold"],
      os: {
        version: "15.5",
        releaseDate: "2022-05"
      }
    },
    reviews: {
      average: 4.8,
      count: 2500
    },
    inclusions: ["charging adapter"],
    warranty: {
      validUntil: 2024
    }
  }
}`;
