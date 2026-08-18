"use client";

import { parseAsString, parseAsStringLiteral, useQueryStates } from "nuqs";
import { useEffect } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type SearchParamsFormProps = {
  initialValues: {
    by: "title" | "reporter" | "assigned";
    q: string;
  };
};

type SearchFormValues = {
  by: "title" | "reporter" | "assigned";
  q: string;
};

const SearchParamsForm = ({ initialValues }: SearchParamsFormProps) => {
  const [, setParams] = useQueryStates(
    {
      by: parseAsStringLiteral(["title", "reporter", "assigned"]).withDefault(
        "title",
      ),
      q: parseAsString.withDefault(""),
    },
    { shallow: false },
  );

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { isSubmitting },
  } = useForm<SearchFormValues>({
    defaultValues: {
      by: initialValues.by,
      q: initialValues.q,
    },
  });

  useEffect(() => {
    reset({ by: initialValues.by, q: initialValues.q });
  }, [initialValues.by, initialValues.q, reset]);

  const onSubmit: SubmitHandler<SearchFormValues> = async (data) => {
    await setParams({
      by: data.by,
      q: data.q.trim() ? data.q.trim() : null,
    });
  };

  const clearSearch = async () => {
    reset({ by: "title", q: "" });
    await setParams({ by: "title", q: null });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-wrap gap-3">
      <Select
        value={watch("by")}
        onValueChange={(value) =>
          setValue("by", value as SearchFormValues["by"], {
            shouldDirty: true,
          })
        }
      >
        <SelectTrigger className="h-8 w-40 font-mono text-xs">
          <SelectValue placeholder="Search by" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="title">Title</SelectItem>
          <SelectItem value="reporter">Reporter</SelectItem>
          <SelectItem value="assigned">Assigned</SelectItem>
        </SelectContent>
      </Select>

      <Input
        {...register("q")}
        placeholder="Search tickets"
        className="h-8 w-64"
      />

      <Button type="submit" size="sm" disabled={isSubmitting}>
        Search
      </Button>
      <Button
        type="button"
        size="sm"
        variant="outline"
        onClick={clearSearch}
        disabled={isSubmitting}
      >
        Clear
      </Button>
    </form>
  );
};

export default SearchParamsForm;
