import { Link } from "react-router-dom";
import { POPULAR_TITLES, popularTitlePath } from "../../config/popularTitles";

export function PopularTitles() {
  return (
    <nav aria-label="Popular titles" className="mt-6 mb-2 px-1 sm:px-0">
      <h2 className="text-sm sm:text-base font-semibold text-[#f5c518] tracking-wide uppercase">
        Popular titles
      </h2>
      <ul className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-sm sm:text-base text-white">
        {POPULAR_TITLES.map((item) => (
          <li key={`${item.type}-${item.id}`}>
            <Link
              to={popularTitlePath(item)}
              className="hover:text-[#f5c518] hover:underline"
            >
              {item.text}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
