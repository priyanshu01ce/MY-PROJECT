import productModel from "../models/productModel.js";
import categoryModel from "../models/categoryModel.js";
import orderModel from "../models/orderModel.js";

import fs from "fs";
import slugify from "slugify";
import dotenv from "dotenv";


dotenv.config();


export const createProductController = async (req, res) => {
  

  try {
    const { name, description, price, category, quantity, shipping } =
      req.fields;
    const { photo } = req.files;

    if(!name, !description, !price, !category, !quantity ) {
      return res.send({message:"All Fields are required"});
    } 
     
    
    //alidation
    switch (true) {
      case !name:
        return res.send({ message: "Name is Required" });
      case !description:
        return res.send({ message: "Description is Required" });
      case !price:
        return res.send({ message: "Price is Required" });
      case !category:
        return res.send({ message: "Category is Required" });
      case !quantity:
        return res.send({ message: "Quantity is Required" });
      case photo && photo.size > 1000000:
        return res
          .send({ message: "photo is Required and should be less then 1mb" });
    }

    const products = new productModel({ ...req.fields, slug: slugify(name) });
    if (photo) {
      products.photo.data = fs.readFileSync(photo.path);
      products.photo.contentType = photo.type;
    }
    await products.save();
    res.status(201).send({
      success: true,
      message: "Product Created Successfully",
      products,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      error,
      message: "Error in creating  product",
    });
  }
};

//get all products
export const getProductController = async (req, res) => {
  try {
    const products = await productModel
      .find({})
      .select("-photo")
      .populate("category")
      .limit(12)
      .sort({ createdAt: -1 });

      
    res.status(200).send({
      success: true,
      counTotal: products.length,
      message: "ALlProducts ",
      products,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Erorr in getting products",
      error: error.message,
    });
  }
};

// get single product
export const getSingleProductController = async (req, res) => {
  try {
    const product = await productModel
      .findById(req.params.id) // Use findById to search by ID
      .select("-photo")
      .populate("category");
    if (!product) {
      // If product with the given ID is not found, return an error response
      return res.status(404).send({
        success: false,
        message: "Product not found",
      });
    }
    res.status(200).send({
      success: true,
      message: "Single Product Fetched",
      product,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error while getting single product",
      error,
    });
  }
};

// get single product
export const getSingleProductsController = async (req, res) => {
  try {
    const product = await productModel
      .findOne({ slug: req.params.slug })
      .select("-photo")
      .populate("category");
    res.status(200).send({
      success: true,
      message: "Single Product Fetched",
      product,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Eror while getitng single product",
      error,
    });
  }
};


// get photo
export const productPhotoController = async (req, res) => {
  try {
    const product = await productModel.findById(req.params.pid).select("photo");
    if (product.photo.data) {
      res.set("Content-type", product.photo.contentType);
      return res.status(200).send(product.photo.data);
    }
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Erorr while getting photo",
      error,
    });
  }
};

//delete controller
export const deleteProductController = async (req, res) => {
  try {
    await productModel.findByIdAndDelete(req.params.pid).select("-photo");
    res.status(200).send({
      success: true,
      message: "Product Deleted successfully",
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error while deleting product",
      error,
    });
  }
};

//Updat Products
export const updateProductController = async (req, res) => {
  try {
    const { name, description, price, category, quantity, shipping } =
      req.fields;
    const { photo } = req.files;

    // Validation
    if (!name || !description || !price || !category || !quantity) {
      return res
        .status(400)
        .send({
          error:
            "Name, Description, Price, Category, and Quantity are required",
        });
    }

    if (photo && photo.size > 1000000) {
      return res.status(400).send({ error: "Photo should be less than 1MB" });
    }

    const product = await productModel.findById(req.params.pid);
    if (!product) {
      return res.status(404).send({ error: "Product not found" });
    }

    // Update product fields
    product.name = name;
    product.description = description;
    product.price = price;
    product.category = category;
    product.quantity = quantity;
    product.slug = slugify(name);

    // Update photo if provided
    if (photo) {
      product.photo = {
        data: fs.readFileSync(photo.path),
        contentType: photo.type,
      };
    }

    await product.save();

    res.status(200).send({
      success: true,
      message: "Product Updated Successfully",
      product,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({
      success: false,
      error,
      message: "Error in updating product",
    });
  }
};


// filters
export const productFiltersController = async (req, res) => {
  try {
    const { checked, radio } = req.body;
    // console.log("checked:", checked);
    // console.log("radio:", radio);

    let args = {};

    // Check if checked is an array and has elements
    if (Array.isArray(checked) && checked.length > 0) {
      args.category = checked;
    }

    // Check if radio is an array and has exactly 2 elements
    if (Array.isArray(radio) && radio.length === 2) {
      args.price = { $gte: radio[0], $lte: radio[1] };
    }

    const products = await productModel.find(args);

    res.status(200).send({
      success: true,
      products,
    });
  } catch (error) {
    console.error(error);
    res.status(400).send({
      success: false,
      message: "Error while filtering products",
      error: error.message, // Sending only the error message to the client for security reasons
    });
  }
};


// product count
export const productCountController = async (req, res) => {
  try {
    const total = await productModel.find({}).estimatedDocumentCount();
    res.status(200).send({
      success: true,
      total,
    });
  } catch (error) {
    console.log(error);
    res.status(400).send({
      message: "Error in product count",
      error,
      success: false,
    });
  }
};

// product list base on page
export const productListController = async (req, res) => {
  try {
    const perPage = 6;
    const page = req.params.page ? req.params.page : 1;
    const products = await productModel
      .find({})
      .select("-photo")
      .skip((page - 1) * perPage)
      .limit(perPage)
      .sort({ createdAt: -1 });
    res.status(200).send({
      success: true,
      products,
    });
  } catch (error) {
    console.log(error);
    res.status(400).send({
      success: false,
      message: "error in per page ctrl",
      error,
    });
  }
};

// search product
export const searchProductController = async (req, res) => {
  try {
    const { keyword } = req.params;
    const resutls = await productModel
      .find({
        $or: [
          { name: { $regex: keyword, $options: "i" } },
          { description: { $regex: keyword, $options: "i" } },
        ],
      })
      .select("-photo");
    res.json(resutls);
  } catch (error) {
    console.log(error);
    res.status(400).send({
      success: false,
      message: "Error In Search Product API",
      error,
    });
  }
};

// similar products
export const realtedProductController = async (req, res) => {
  try {
    const { pid, cid } = req.params;
    const products = await productModel
      .find({
        category: cid,
        _id: { $ne: pid },
      })
      .select("-photo")
      .limit(3)
      .populate("category");
    res.status(200).send({
      success: true,
      products,
    });
  } catch (error) {
    console.log(error);
    res.status(400).send({
      success: false,
      message: "error while geting related product",
      error,
    });
  }
};

// get prdocyst by catgory
export const productCategoryController = async (req, res) => {
  try {
    const category = await categoryModel.findOne({ slug: req.params.slug });
    const products = await productModel.find({ category }).populate("category");
    res.status(200).send({
      success: true,
      category,
      products,
    });
  } catch (error) {
    console.log(error);
    res.status(400).send({
      success: false,
      error,
      message: "Error While Getting products",
    });
  }
};

export const saveTheOrders = async (req, res) => {
  try {
    const { cart,userId} = req.body;

    // Calculate total price
    let total = 0;
    cart.forEach((item) => {
      total += item.price;
    });

    // Create a new order
    const order = new orderModel({
      products: cart,
      buyer: userId
    });

    await order.save();

    res.json({ success: true, message: "Order placed successfully." });
  } catch (error) {
    console.error("Error saving order:", error);
    res.status(500).json({ success: false, message: "Failed to save order." });
  }
};




