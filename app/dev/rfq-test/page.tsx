"use client";

import { FormEvent, useState } from "react";

import { closeRFQ, createRFQ, deleteRFQ, publishRFQ } from "@/lib/rfq";
import type { RFQ, RFQBudgetType } from "@/types/rfq";

export default function RFQTestPage() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [quantity, setQuantity] = useState("");
  const [unit, setUnit] = useState("");
  const [deliveryCountry, setDeliveryCountry] = useState("");
  const [industry, setIndustry] = useState("");
  const [industryCategory, setIndustryCategory] = useState("");
  const [budgetType, setBudgetType] = useState<RFQBudgetType>("negotiable");
  const [createdRFQ, setCreatedRFQ] = useState<RFQ | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [closing, setClosing] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setErrorMessage(null);
    setSuccessMessage(null);
    setCreatedRFQ(null);

    const { data, error } = await createRFQ({
      title,
      description,
      quantity: Number(quantity),
      unit,
      delivery_country: deliveryCountry,
      industry: industry.trim() || undefined,
      industry_category: industryCategory.trim() || undefined,
      budget_type: budgetType,
    });

    setSubmitting(false);

    if (error) {
      setErrorMessage(error.message ?? "Failed to create RFQ.");
      return;
    }

    if (data) {
      console.log("Created RFQ:", data);
      setCreatedRFQ(data);
    }
  }

  async function handlePublish() {
    if (!createdRFQ) {
      return;
    }

    setPublishing(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    const { data, error } = await publishRFQ(createdRFQ.id);

    setPublishing(false);

    if (error) {
      setErrorMessage(error.message ?? "Failed to publish RFQ.");
      return;
    }

    if (data) {
      console.log("Published RFQ:", data);
      setCreatedRFQ(data);
    }
  }

  async function handleClose() {
    if (!createdRFQ) {
      return;
    }

    setClosing(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    const { data, error } = await closeRFQ(createdRFQ.id);

    setClosing(false);

    if (error) {
      setErrorMessage(error.message ?? "Failed to close RFQ.");
      return;
    }

    if (data) {
      console.log("Closed RFQ:", data);
      setCreatedRFQ(data);
    }
  }

  async function handleDelete() {
    if (!createdRFQ) {
      return;
    }

    setDeleting(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    const result = await deleteRFQ(createdRFQ.id);

    setDeleting(false);
    console.log("Delete RFQ result:", result);

    if (result.error) {
      setErrorMessage(result.error.message ?? "Failed to delete RFQ.");
      return;
    }

    setCreatedRFQ(null);
    setSuccessMessage("RFQ deleted successfully.");
  }

  return (
    <main>
      <h1>RFQ Test Page</h1>
      <p>Temporary developer page for Sprint 14 RFQ testing.</p>

      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="title">Title</label>
          <br />
          <input
            id="title"
            name="title"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            required
          />
        </div>

        <div>
          <label htmlFor="description">Description</label>
          <br />
          <textarea
            id="description"
            name="description"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            required
          />
        </div>

        <div>
          <label htmlFor="quantity">Quantity</label>
          <br />
          <input
            id="quantity"
            name="quantity"
            type="number"
            min="0.01"
            step="any"
            value={quantity}
            onChange={(event) => setQuantity(event.target.value)}
            required
          />
        </div>

        <div>
          <label htmlFor="unit">Unit</label>
          <br />
          <input
            id="unit"
            name="unit"
            value={unit}
            onChange={(event) => setUnit(event.target.value)}
            required
          />
        </div>

        <div>
          <label htmlFor="deliveryCountry">Delivery Country</label>
          <br />
          <input
            id="deliveryCountry"
            name="deliveryCountry"
            value={deliveryCountry}
            onChange={(event) => setDeliveryCountry(event.target.value)}
            required
          />
        </div>

        <div>
          <label htmlFor="industry">Industry (optional)</label>
          <br />
          <input
            id="industry"
            name="industry"
            value={industry}
            onChange={(event) => setIndustry(event.target.value)}
          />
        </div>

        <div>
          <label htmlFor="industryCategory">Industry Category (optional)</label>
          <br />
          <input
            id="industryCategory"
            name="industryCategory"
            value={industryCategory}
            onChange={(event) => setIndustryCategory(event.target.value)}
          />
        </div>

        <div>
          <label htmlFor="budgetType">Budget Type</label>
          <br />
          <select
            id="budgetType"
            name="budgetType"
            value={budgetType}
            onChange={(event) =>
              setBudgetType(event.target.value as RFQBudgetType)
            }
          >
            <option value="negotiable">Negotiable</option>
            <option value="fixed">Fixed</option>
          </select>
        </div>

        <button type="submit" disabled={submitting}>
          {submitting ? "Creating..." : "Create RFQ"}
        </button>
      </form>

      {errorMessage ? <p>Error: {errorMessage}</p> : null}
      {successMessage ? <p>{successMessage}</p> : null}

      {createdRFQ ? (
        <div>
          <h2>RFQ Created</h2>
          <p>RFQ ID: {createdRFQ.id}</p>
          <p>Status: {createdRFQ.status}</p>
          <p>Budget Type: {createdRFQ.budget_type}</p>
          {createdRFQ.status === "draft" ? (
            <button type="button" onClick={handlePublish} disabled={publishing}>
              {publishing ? "Publishing..." : "Publish RFQ"}
            </button>
          ) : null}
          {createdRFQ.status === "open" ? (
            <button type="button" onClick={handleClose} disabled={closing}>
              {closing ? "Closing..." : "Close RFQ"}
            </button>
          ) : null}
          <button type="button" onClick={handleDelete} disabled={deleting}>
            {deleting ? "Deleting..." : "Delete RFQ"}
          </button>
        </div>
      ) : null}
    </main>
  );
}
