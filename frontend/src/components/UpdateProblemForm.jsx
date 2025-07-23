import { useEffect } from "react";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Editor from "@monaco-editor/react";
import {
  FileText,
  BookOpen,
  CheckCircle2,
  Code2,
  Lightbulb,
  Plus,
  Trash2,
} from "lucide-react";

import { problemSchema } from "../schema/problemSchema.js";
import { useProblemStore } from "../store/useProblemStore.js";
import { useNavigate } from "react-router-dom";

const UpdateProblemForm = ({ problemId, initialData }) => {
  /* -------------------------- react-hook-form setup -------------------------- */
  const {
    register,
    control,
    reset,
    handleSubmit,
    getValues,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(problemSchema),
    defaultValues: {
      /* provide safe fall-backs while the real data is loading */
      title: "",
      description: "",
      difficulty: "EASY",
      tags: [""],
      constraints: "",
      hints: "",
      editorial: "",
      testcases: [{ input: "", output: "" }],
      examples: {
        JAVASCRIPT: { input: "", output: "", explanation: "" },
        PYTHON: { input: "", output: "", explanation: "" },
        JAVA: { input: "", output: "", explanation: "" },
      },
      codeSnippets: {
        JAVASCRIPT: "",
        PYTHON: "",
        JAVA: "",
      },
      referrenceSolutions: {
        JAVASCRIPT: "",
        PYTHON: "",
        JAVA: "",
      },
    },
  });

  /* once the caller passes real data → populate the form */
  useEffect(() => {
    if (initialData) reset(initialData);
  }, [initialData, reset]);

  /* field-arrays for dynamic sections */
  const {
    fields: testCaseFields,
    append: appendTestCase,
    remove: removeTestCase,
  } = useFieldArray({ control, name: "testcases" });

  const {
    fields: tagFields,
    append: appendTag,
    remove: removeTag,
  } = useFieldArray({ control, name: "tags" });

  const { isProblemLoading, updateProblem, getAllProblems } = useProblemStore();

  const navigate = useNavigate();

  const handleUpdate = async (data) => {
    console.log("Submitting", data);
    const res = await updateProblem(problemId, data);
    if (res) {
      await getAllProblems();
      navigate("/");
    }
  };

  return (
    <div className="container mx-auto py-8 px-4 max-w-7xl pt-24">
      <div className="card bg-base-100 shadow-xl">
        <div className="card-body p-6 md:p-8">
          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 md:mb-8 pb-4 border-b">
            <h2 className="card-title text-2xl md:text-3xl flex items-center gap-3">
              <FileText className="w-6 h-6 md:w-8 md:h-8 text-primary" />
              Edit Problem
            </h2>
          </div>

          {/* Form body */}
          <form
            onSubmit={handleSubmit(handleUpdate, (err) => {
              console.log("❌ validation errors", err);
            })}
            className="space-y-8"
          >
            {/* ----------------------- Basic information ----------------------- */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Title */}
              <div className="form-control md:col-span-2">
                <label className="label">
                  <span className="label-text font-semibold text-base md:text-lg">
                    Title
                  </span>
                </label>
                <input
                  {...register("title")}
                  className="input input-bordered w-full"
                  placeholder="Problem title"
                />
                {errors.title && (
                  <p className="label-text-alt text-error">
                    {errors.title.message}
                  </p>
                )}
              </div>

              {/* Description */}
              <div className="form-control md:col-span-2">
                <label className="label">
                  <span className="label-text font-semibold text-base md:text-lg">
                    Description
                  </span>
                </label>
                <textarea
                  {...register("description")}
                  className="textarea textarea-bordered min-h-32 w-full resize-y"
                  placeholder="Problem description"
                />
                {errors.description && (
                  <p className="label-text-alt text-error">
                    {errors.description.message}
                  </p>
                )}
              </div>

              {/* Difficulty */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-semibold text-base md:text-lg">
                    Difficulty
                  </span>
                </label>
                <select
                  {...register("difficulty")}
                  className="select select-bordered w-full"
                >
                  <option value="EASY">Easy</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HARD">Hard</option>
                </select>
                {errors.difficulty && (
                  <p className="label-text-alt text-error">
                    {errors.difficulty.message}
                  </p>
                )}
              </div>
            </div>

            {/* ----------------------------- Tags ----------------------------- */}
            <div className="card bg-base-200 p-4 md:p-6 shadow-md">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg md:text-xl font-semibold flex items-center gap-2">
                  <BookOpen className="w-5 h-5" />
                  Tags
                </h3>
                <button
                  type="button"
                  onClick={() => appendTag("")}
                  className="btn btn-primary btn-sm"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Add Tag
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {tagFields.map((field, idx) => (
                  <div key={field.id} className="flex gap-2 items-center">
                    <input
                      {...register(`tags.${idx}`)}
                      className="input input-bordered flex-1"
                      placeholder="tag"
                    />
                    <button
                      type="button"
                      className="btn btn-ghost btn-square btn-sm"
                      onClick={() => removeTag(idx)}
                      disabled={tagFields.length === 1}
                    >
                      <Trash2 className="w-4 h-4 text-error" />
                    </button>
                  </div>
                ))}
              </div>
              {errors.tags && (
                <p className="mt-2 text-error text-sm">{errors.tags.message}</p>
              )}
            </div>

            {/* -------------------------- Test cases -------------------------- */}
            <div className="card bg-base-200 p-4 md:p-6 shadow-md">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg md:text-xl font-semibold flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5" />
                  Test Cases
                </h3>
                <button
                  type="button"
                  onClick={() => appendTestCase({ input: "", output: "" })}
                  className="btn btn-primary btn-sm"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Add Test Case
                </button>
              </div>

              <div className="space-y-6">
                {testCaseFields.map((field, idx) => (
                  <div key={field.id} className="card bg-base-100 shadow-md">
                    <div className="card-body p-4 md:p-6">
                      <div className="flex justify-between items-center mb-4">
                        <h4 className="font-semibold">Test Case #{idx + 1}</h4>
                        <button
                          type="button"
                          onClick={() => removeTestCase(idx)}
                          disabled={testCaseFields.length === 1}
                          className="btn btn-ghost btn-sm text-error"
                        >
                          <Trash2 className="w-4 h-4 mr-1" />
                          Remove
                        </button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* input */}
                        <textarea
                          {...register(`testcases.${idx}.input`)}
                          className="textarea textarea-bordered min-h-24 w-full resize-y"
                          placeholder="Input"
                        />
                        {errors.testcases?.[idx]?.input && (
                          <p className="label-text-alt text-error">
                            {errors.testcases[idx].input.message}
                          </p>
                        )}

                        {/* output */}
                        <textarea
                          {...register(`testcases.${idx}.output`)}
                          className="textarea textarea-bordered min-h-24 w-full resize-y"
                          placeholder="Expected output"
                        />
                        {errors.testcases?.[idx]?.output && (
                          <p className="label-text-alt text-error">
                            {errors.testcases[idx].output.message}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {errors.testcases && !Array.isArray(errors.testcases) && (
                <p className="mt-2 text-error text-sm">
                  {errors.testcases.message}
                </p>
              )}
            </div>

            {/* ---------------------- Code / solutions ----------------------- */}
            {["JAVASCRIPT", "PYTHON", "JAVA"].map((lang) => (
              <div key={lang} className="space-y-8">
                <div className="card bg-base-200 p-4 md:p-6 shadow-md">
                  <h3 className="text-lg md:text-xl font-semibold mb-6 flex items-center gap-2">
                    <Code2 className="w-5 h-5" />
                    {lang}
                  </h3>

                  {/* Starter code */}
                  <div className="card bg-base-100 shadow-md">
                    <div className="card-body p-4 md:p-6">
                      <h4 className="font-semibold mb-4">Starter Code</h4>
                      <Controller
                        name={`codeSnippets.${lang}`}
                        control={control}
                        render={({ field }) => (
                          <Editor
                            height="300px"
                            language={lang.toLowerCase()}
                            theme="vs-dark"
                            {...field}
                            options={{
                              minimap: { enabled: false },
                              fontSize: 14,
                              automaticLayout: true,
                            }}
                          />
                        )}
                      />
                      {errors.codeSnippets?.[lang] && (
                        <p className="mt-2 text-error text-sm">
                          {errors.codeSnippets[lang].message}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Reference solution */}
                  <div className="card bg-base-100 shadow-md">
                    <div className="card-body p-4 md:p-6">
                      <h4 className="font-semibold mb-4 flex items-center gap-2">
                        <CheckCircle2 className="w-5 h-5 text-success" />
                        Reference Solution
                      </h4>
                      <Controller
                        name={`referrenceSolutions.${lang}`}
                        control={control}
                        render={({ field }) => (
                          <Editor
                            height="300px"
                            language={lang.toLowerCase()}
                            theme="vs-dark"
                            {...field}
                            options={{
                              minimap: { enabled: false },
                              fontSize: 14,
                              automaticLayout: true,
                            }}
                          />
                        )}
                      />
                      {errors.referrenceSolutions?.[lang] && (
                        <p className="mt-2 text-error text-sm">
                          {errors.referrenceSolutions[lang].message}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {/* -------------------- Additional information -------------------- */}
            <div className="card bg-base-200 p-4 md:p-6 shadow-md">
              <h3 className="text-lg md:text-xl font-semibold mb-6 flex items-center gap-2">
                <Lightbulb className="w-5 h-5 text-warning" />
                Additional Information
              </h3>

              {/* Constraints */}
              <div className="form-control mb-6">
                <label className="label">
                  <span className="label-text font-medium">Constraints</span>
                </label>
                <textarea
                  {...register("constraints")}
                  className="textarea textarea-bordered min-h-24 w-full resize-y"
                />
                {errors.constraints && (
                  <p className="label-text-alt text-error">
                    {errors.constraints.message}
                  </p>
                )}
              </div>

              {/* Hints */}
              <div className="form-control mb-6">
                <label className="label">
                  <span className="label-text font-medium">Hints</span>
                </label>
                <textarea
                  {...register("hints")}
                  className="textarea textarea-bordered min-h-24 w-full resize-y"
                />
              </div>

              {/* Editorial */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium">Editorial</span>
                </label>
                <textarea
                  {...register("editorial")}
                  className="textarea textarea-bordered min-h-32 w-full resize-y"
                />
              </div>
            </div>

            {/* ------------------------------ Submit ------------------------------ */}
            <div className="card-actions justify-end pt-4 border-t">
              <button type="submit" className="btn btn-primary btn-lg gap-2">
                {isProblemLoading ? (
                  <span className="loading loading-spinner text-white"></span>
                ) : (
                  <>
                    <CheckCircle2 className="w-5 h-5" />
                    Update Problem
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default UpdateProblemForm;
