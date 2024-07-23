const express = require("express");
const fs = require("fs").promises;
const path = require("path");
const { v4: uuidv4 } = require("uuid");
const Joi = require("joi");

const router = express.Router();

const contactsPath = path.join(__dirname, "../../data/contacts.json");

const readContacts = async () => {
  const data = await fs.readFile(contactsPath, "utf-8");
  return JSON.parse(data);
};

const writeContacts = async (contacts) => {
  await fs.writeFile(contactsPath, JSON.stringify(contacts, null, 2));
};

router.get("/", async (req, res, next) => {
  try {
    const contacts = await readContacts();
    res.status(200).json(contacts);
  } catch (error) {
    next(error);
  }
});

router.get("/:contactId", async (req, res, next) => {
  try {
    const { contactId } = req.params;
    const contacts = await readContacts();
    const contact = contacts.find((contact) => contact.id === contactId);

    if (!contact) {
      return res.status(404).json({ message: "Not found" });
    }

    res.status(200).json(contact);
  } catch (error) {
    next(error);
  }
});

router.post("/", async (req, res, next) => {
  try {
    const schema = Joi.object({
      name: Joi.string().required(),
      email: Joi.string().email().required(),
      phone: Joi.string().required(),
    });

    const { error } = schema.validate(req.body);
    if (error) {
      return res
        .status(400)
        .json({
          message: `missing required ${error.details[0].context.key} - field`,
        });
    }

    const newContact = { id: uuidv4(), ...req.body };
    const contacts = await readContacts();
    contacts.push(newContact);

    await writeContacts(contacts);
    res.status(201).json(newContact);
  } catch (error) {
    next(error);
  }
});

router.delete("/:contactId", async (req, res, next) => {
  try {
    const { contactId } = req.params;
    const contacts = await readContacts();
    const index = contacts.findIndex((contact) => contact.id === contactId);

    if (index === -1) {
      return res.status(404).json({ message: "Not found" });
    }

    contacts.splice(index, 1);
    await writeContacts(contacts);
    res.status(200).json({ message: "contact deleted" });
  } catch (error) {
    next(error);
  }
});

router.put("/:contactId", async (req, res, next) => {
  try {
    const { contactId } = req.params;
    const schema = Joi.object({
      name: Joi.string(),
      email: Joi.string().email(),
      phone: Joi.string(),
    }).min(1);

    const { error } = schema.validate(req.body);
    if (error) {
      return res.status(400).json({ message: "missing fields" });
    }

    const contacts = await readContacts();
    const index = contacts.findIndex((contact) => contact.id === contactId);

    if (index === -1) {
      return res.status(404).json({ message: "Not found" });
    }

    contacts[index] = { ...contacts[index], ...req.body };
    await writeContacts(contacts);
    res.status(200).json(contacts[index]);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
